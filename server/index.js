// ============================================================================
// EXPRESS API SERVER
// ============================================================================
//
// REST API that wraps the rule engine for SaaS consumption.
//
// Start:   npm start   (or  node server/index.js)
//
// Endpoints:
//   GET  /api/health                    — health check (uptime, version, rules)
//   GET  /api/rules                     — list all rules (id, name, concept, tags, …)
//   GET  /api/rules/:id                 — single rule metadata
//   POST /api/rules/:id/generate        — generate a question  { difficulty?, params? }
//   POST /api/rules/:id/generate-batch  — generate N questions { difficulty, count }
//   GET  /api/schools                   — list all schools with labels
//   GET  /api/schools/:id/config        — full concept/slot config for a school
//   GET  /api/schools/:id/slots         — flat slot array (paper blueprint)
//   GET  /api/display-config            — conceptExplanations, titles, schoolFullNames
//   POST /api/papers/generate           — generate a full paper  { school }
//
// ============================================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./logger');

// --- Rule engine imports (CommonJS, same modules the browser bundle uses) ---
const { getRule, listRules, listRuleIds } = require('../rules/ruleRegistry');
const { createOptions, shuffle } = require('../rules/utils');
const { generateMCQOptions, shuffleOptionsWithAnswer } = require('../rules/mcqHelpers');

// --- Data layer (Firestore-first, JSON fallback) ---
const dataLoader = require('./dataLoader');
const { verifyAdmin } = require('./authMiddleware');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ── Security headers (helmet) ───────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false,   // allow inline scripts in app.html for now
    crossOriginEmbedderPolicy: false
}));

// ── CORS ────────────────────────────────────────────────────────────────────
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map(s => s.trim())
}));

app.use(express.json({ limit: '1mb' }));

// ── Rate limiting ───────────────────────────────────────────────────────────
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;

// General API limiter
const apiLimiter = rateLimit({
    windowMs,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests — please try again later.' }
});

// Stricter limiter for generation endpoints (expensive operations)
const generateLimiter = rateLimit({
    windowMs,
    max: parseInt(process.env.RATE_LIMIT_GENERATE_MAX, 10) || 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Generation rate limit reached — please wait before generating more.' }
});

// Apply general limiter to all /api/ routes
app.use('/api/', apiLimiter);

// ── Request logging middleware ──────────────────────────────────────────────
app.use((req, res, next) => {
    if (!req.path.startsWith('/api/')) return next(); // skip static files
    const start = Date.now();
    const origEnd = res.end.bind(res);
    res.end = function (...args) {
        const ms = Date.now() - start;
        const body = req.method === 'POST' ? ` ${JSON.stringify(req.body)}` : '';
        logger.info(`${req.method} ${req.originalUrl}${body} → ${res.statusCode} (${ms}ms)`);
        origEnd(...args);
    };
    next();
});

// ── Static files (serve the browser app) ────────────────────────────────────
app.use(express.static(path.join(__dirname, '..')));

// Redirect root to app.html
app.get('/', (req, res) => {
    res.redirect('/app.html');
});

// ============================================================================
// INPUT VALIDATION HELPERS
// ============================================================================

const VALID_RULE_IDS = new Set(listRuleIds());

function validateSchool(school) {
    if (!school || typeof school !== 'string') {
        return 'Missing required field: "school"';
    }
    const sanitized = school.trim().toUpperCase();
    const validSchools = dataLoader.listSchools();
    if (!validSchools.includes(sanitized)) {
        return `Invalid school "${school}". Valid: ${validSchools.join(', ')}`;
    }
    return null; // valid
}

function validateRuleId(id) {
    if (!id || typeof id !== 'string') {
        return 'Missing rule ID';
    }
    const sanitized = id.trim();
    if (sanitized.length > 100) return 'Rule ID too long';
    if (!/^[a-z0-9_]+$/.test(sanitized)) return `Invalid rule ID format: "${id}"`;
    return null; // format valid (existence checked via getRule)
}

function validateDifficulty(difficulty, rule) {
    if (!difficulty) return null; // optional, will use default
    if (typeof difficulty !== 'string') return 'Difficulty must be a string';
    const sanitized = difficulty.trim().toLowerCase();
    const validDiffs = Object.keys(rule.difficultyConfig || {});
    if (!validDiffs.includes(sanitized)) {
        return `Unknown difficulty "${difficulty}" for rule "${rule.id}". Valid: ${validDiffs.join(', ')}`;
    }
    return null; // valid
}

function validateCount(count) {
    const n = parseInt(count, 10);
    if (isNaN(n) || n < 1) return 'Count must be a positive integer';
    if (n > 100) return 'Count cannot exceed 100';
    return null; // valid
}

// ============================================================================
// API ROUTES
// ============================================================================

// ---------- Health check ----------------------------------------------------

const pkg = require('../package.json');
const startTime = Date.now();

/**
 * GET /api/health
 * Returns server health information.
 */
app.get('/api/health', (req, res) => {
    const uptimeMs = Date.now() - startTime;
    res.json({
        status: 'ok',
        version: pkg.version,
        uptime: `${Math.floor(uptimeMs / 1000)}s`,
        uptimeMs,
        env: NODE_ENV,
        rules: listRuleIds().length,
        schools: dataLoader.listSchools().length,
        dataSource: dataLoader.getDataSource(),
        timestamp: new Date().toISOString()
    });
});

// ---------- Rules -----------------------------------------------------------

/**
 * GET /api/rules
 * Returns an array of rule summaries.
 */
app.get('/api/rules', (req, res) => {
    const rules = listRules().map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        concept: r.concept,
        tags: r.tags,
        gradeLevel: r.gradeLevel,
        answerType: r.answerType,
        difficulties: Object.keys(r.difficultyConfig || {})
    }));
    res.json({ rules });
});

/**
 * GET /api/rules/:id
 * Returns full metadata for a single rule.
 */
app.get('/api/rules/:id', (req, res) => {
    const idErr = validateRuleId(req.params.id);
    if (idErr) return res.status(400).json({ error: idErr });

    const rule = getRule(req.params.id);
    if (!rule) return res.status(404).json({ error: `Rule "${req.params.id}" not found` });

    res.json({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        concept: rule.concept,
        tags: rule.tags,
        gradeLevel: rule.gradeLevel,
        answerType: rule.answerType,
        difficulties: Object.keys(rule.difficultyConfig || {})
    });
});

/**
 * POST /api/rules/:id/generate
 * Body (optional): { difficulty: 'easy', params: { ... } }
 * Returns a generated question + answer.
 */
app.post('/api/rules/:id/generate', generateLimiter, (req, res) => {
    const idErr = validateRuleId(req.params.id);
    if (idErr) return res.status(400).json({ error: idErr });

    const rule = getRule(req.params.id);
    if (!rule) return res.status(404).json({ error: `Rule "${req.params.id}" not found` });

    try {
        const { difficulty, params } = req.body || {};

        // Validate difficulty if provided
        if (difficulty) {
            const diffErr = validateDifficulty(difficulty, rule);
            if (diffErr) return res.status(400).json({ error: diffErr });
        }

        let question;

        if (difficulty && rule.generateForDifficulty) {
            question = rule.generateForDifficulty(difficulty);
        } else if (params) {
            question = rule.generate(params);
        } else {
            // Default: pick a random difficulty
            const diffs = Object.keys(rule.difficultyConfig || {});
            const randDiff = diffs[Math.floor(Math.random() * diffs.length)];
            question = rule.generateForDifficulty(randDiff);
        }

        // Attach formatted question text
        if (rule.formatQuestion && question.questionData) {
            question.formattedQuestion = rule.formatQuestion(question.questionData);
        }

        res.json({ ruleId: rule.id, question });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ── Helper: build display options for a generated question ──────────────────
function buildDisplayOptions(rule, questionData, answer) {
    let displayOptions = [];
    let correctLetter = '';

    if (questionData.isMCQ) {
        // String-based MCQ (e.g. cashier notes, notebook pen combo)
        let correctAnswer = '';
        if (answer && typeof answer === 'object') {
            if (answer.count1 != null && answer.count2 != null) {
                const l1 = questionData.label1 || 'type 1';
                const l2 = questionData.label2 || 'type 2';
                correctAnswer = `${answer.count1} of ${l1} and ${answer.count2} of ${l2}`;
            } else if (answer.notebooks != null && answer.pens != null) {
                correctAnswer = `${answer.notebooks} notebooks and ${answer.pens} pens`;
            }
        }
        const options = generateMCQOptions(correctAnswer);
        const shuffled = shuffleOptionsWithAnswer(options, correctAnswer);
        displayOptions = shuffled.options.map((opt, i) => ({
            letter: String.fromCharCode(65 + i), text: opt
        }));
        correctLetter = shuffled.correctLetter;
    } else {
        // Numeric answer MCQ
        const numericAnswer = typeof answer === 'object' ? null : answer;
        if (numericAnswer != null) {
            const { options, correctLetter: cl } = createOptions(numericAnswer);
            correctLetter = cl;
            displayOptions = options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                let displayOpt = opt;
                if (questionData.type && opt === numericAnswer) {
                    displayOpt = `${questionData.type.charAt(0).toUpperCase() + questionData.type.slice(1)} of ₹${opt}`;
                } else if (questionData.type) {
                    const randType = Math.random() < 0.5 ? 'Profit' : 'Loss';
                    displayOpt = `${randType} of ₹${opt}`;
                }
                return { letter, text: String(displayOpt) };
            });
        }
    }

    return { displayOptions, correctLetter };
}

/**
 * POST /api/rules/:id/generate-batch
 * Body: { difficulty: 'easy', count: 12 }
 * Returns an array of generated questions with display options.
 */
app.post('/api/rules/:id/generate-batch', generateLimiter, (req, res) => {
    const idErr = validateRuleId(req.params.id);
    if (idErr) return res.status(400).json({ error: idErr });

    const rule = getRule(req.params.id);
    if (!rule) return res.status(404).json({ error: `Rule "${req.params.id}" not found` });

    const { difficulty, count = 1 } = req.body || {};

    // Validate count
    const countErr = validateCount(count);
    if (countErr) return res.status(400).json({ error: countErr });

    // Validate difficulty
    const diffKey = difficulty || Object.keys(rule.difficultyConfig || {})[0];
    if (difficulty) {
        const diffErr = validateDifficulty(difficulty, rule);
        if (diffErr) return res.status(400).json({ error: diffErr });
    }

    const n = Math.min(Math.max(parseInt(count) || 1, 1), 100);

    const questions = [];
    let attempts = 0;
    const maxAttempts = n * 50;

    while (questions.length < n && attempts < maxAttempts) {
        attempts++;
        try {
            const { questionData, answer } = rule.generateForDifficulty(diffKey);
            const questionText = rule.formatQuestion(questionData);
            const { displayOptions, correctLetter } = buildDisplayOptions(rule, questionData, answer);

            questions.push({
                question: questionText,
                answer: typeof answer === 'object' ? null : answer,
                isMCQ: !!questionData.isMCQ,
                correctAnswer: questionData.isMCQ ? (displayOptions.find(o => o.letter === correctLetter) || {}).text || '' : null,
                type: questionData.type || null,
                ruleId: rule.id,
                displayOptions,
                correctLetter
            });
        } catch (e) {
            continue; // retry on constraint failures
        }
    }

    res.json({
        ruleId: rule.id,
        difficulty: diffKey,
        requested: n,
        generated: questions.length,
        questions
    });
});

// ---------- Schools ---------------------------------------------------------

/**
 * GET /api/schools
 * Returns the list of schools with labels.
 */
app.get('/api/schools', (req, res) => {
    const schoolLabels = dataLoader.getSchoolLabels();
    const schools = dataLoader.listSchools().map(s => ({
        id: s,
        label: schoolLabels[s] || s
    }));
    res.json({ schools });
});

/**
 * GET /api/schools/:id/config
 * Returns the concept configuration for a school (for dropdown population).
 */
app.get('/api/schools/:id/config', (req, res) => {
    const schoolErr = validateSchool(req.params.id);
    if (schoolErr) return res.status(400).json({ error: schoolErr });

    const config = dataLoader.getConceptConfig(req.params.id);
    if (!config) return res.status(404).json({ error: `School "${req.params.id}" not found` });
    res.json({ school: req.params.id, concepts: config });
});

/**
 * GET /api/schools/:id/slots
 * Returns the flat slot array (paper blueprint) for a school.
 */
app.get('/api/schools/:id/slots', (req, res) => {
    const schoolErr = validateSchool(req.params.id);
    if (schoolErr) return res.status(400).json({ error: schoolErr });

    const slots = dataLoader.getSlots(req.params.id);
    if (!slots) return res.status(404).json({ error: `School "${req.params.id}" not found` });
    res.json({ school: req.params.id, totalSlots: slots.length, slots });
});

// ---------- Display config --------------------------------------------------

/**
 * GET /api/display-config
 * Returns all display configuration (explanations, titles, school names).
 */
app.get('/api/display-config', (req, res) => {
    res.json({
        conceptExplanations: dataLoader.getConceptExplanations(),
        conceptDisplayTitles: dataLoader.getConceptDisplayTitles(),
        schoolFullNames: dataLoader.getSchoolFullNames()
    });
});

// ---------- Papers (batch generation) ---------------------------------------

/**
 * POST /api/papers/generate
 * Body: { school: 'SOP' }
 *
 * Generates a complete test paper (all 16 slots) for the given school in one call.
 * Returns questions grouped by concept, with formatted text, answers, and metadata.
 */
app.post('/api/papers/generate', generateLimiter, (req, res) => {
    const { school } = req.body || {};

    const schoolErr = validateSchool(school);
    if (schoolErr) {
        return res.status(400).json({ error: schoolErr });
    }

    const slots = dataLoader.getSlots(school);
    if (!slots) {
        return res.status(404).json({ error: `School "${school}" not found` });
    }

    const schoolLabels = dataLoader.getSchoolLabels();
    const schoolFullNames = dataLoader.getSchoolFullNames();
    const schoolLabel = schoolLabels[school] || school;
    const schoolFullName = schoolFullNames[school] || schoolLabel;

    // Generate all questions
    const questions = [];
    const conceptOrder = [];
    const conceptSeen = {};

    for (const slot of slots) {
        const rule = getRule(slot.ruleId);
        if (!rule) {
            return res.status(500).json({ error: `Rule "${slot.ruleId}" not found in registry` });
        }

        try {
            const generated = rule.generateForDifficulty(slot.difficulty);

            // Format the question text
            let formattedQuestion = '';
            if (rule.formatQuestion && generated.questionData) {
                formattedQuestion = rule.formatQuestion(generated.questionData);
            }

            // Build display options (MCQ choices) server-side
            const { displayOptions, correctLetter } = buildDisplayOptions(rule, generated.questionData, generated.answer);

            // For MCQ rules, build the correctAnswer string
            let correctAnswer = null;
            if (generated.questionData.isMCQ && generated.answer && typeof generated.answer === 'object') {
                if (generated.answer.count1 != null && generated.answer.count2 != null) {
                    const l1 = generated.questionData.label1 || 'type 1';
                    const l2 = generated.questionData.label2 || 'type 2';
                    correctAnswer = `${generated.answer.count1} of ${l1} and ${generated.answer.count2} of ${l2}`;
                } else if (generated.answer.notebooks != null && generated.answer.pens != null) {
                    correctAnswer = `${generated.answer.notebooks} notebooks and ${generated.answer.pens} pens`;
                }
            }

            // Track concept order (first occurrence)
            if (!conceptSeen[slot.concept]) {
                conceptSeen[slot.concept] = true;
                conceptOrder.push(slot.concept);
            }

            questions.push({
                slotLabel: slot.label,
                concept: slot.concept,
                ruleId: slot.ruleId,
                ruleName: rule.name,
                difficulty: slot.difficulty,
                answerType: rule.answerType,
                question: formattedQuestion,
                answer: typeof generated.answer === 'object' ? null : generated.answer,
                isMCQ: !!generated.questionData.isMCQ,
                correctAnswer: correctAnswer,
                type: generated.questionData.type || null,
                displayOptions,
                correctLetter,
                formattedQuestion
            });
        } catch (err) {
            return res.status(500).json({
                error: `Failed to generate question for slot "${slot.label}" (${slot.ruleId}): ${err.message}`
            });
        }
    }

    // Group by concept for structured output
    const byConcept = {};
    const conceptDisplayTitles = dataLoader.getConceptDisplayTitles();
    const conceptExplanations = dataLoader.getConceptExplanations();
    for (const q of questions) {
        if (!byConcept[q.concept]) {
            byConcept[q.concept] = {
                conceptTitle: conceptDisplayTitles[q.concept] || q.concept,
                explanation: conceptExplanations[q.concept] || [],
                questions: []
            };
        }
        byConcept[q.concept].questions.push(q);
    }

    res.json({
        school: school,
        schoolLabel: schoolLabel,
        schoolFullName: schoolFullName,
        totalQuestions: questions.length,
        conceptOrder: conceptOrder,
        concepts: byConcept,
        // Flat array for easy iteration
        allQuestions: questions
    });
});

// ============================================================================
// ADMIN ROUTES (CRUD for schools, concepts, display config)
// ============================================================================

/**
 * POST /api/admin/refresh
 * Force reload data from Firestore.
 */
app.post('/api/admin/refresh', verifyAdmin, async (req, res) => {
    try {
        const source = await dataLoader.refreshCache();
        res.json({ message: 'Cache refreshed', source, data: dataLoader.getDataSource() });
    } catch (err) {
        res.status(500).json({ error: 'Failed to refresh: ' + err.message });
    }
});

/**
 * GET /api/admin/schools/:id
 * Get full school data (for edit form).
 */
app.get('/api/admin/schools/:id', verifyAdmin, (req, res) => {
    const schoolId = req.params.id.trim().toUpperCase();
    const schoolLabels = dataLoader.getSchoolLabels();
    const schoolFullNames = dataLoader.getSchoolFullNames();
    const schoolRuleMap = dataLoader.getSchoolRuleMap();
    const conceptDisplayLabels = dataLoader.getConceptDisplayLabels();

    if (!schoolRuleMap[schoolId]) {
        return res.status(404).json({ error: `School "${schoolId}" not found` });
    }

    const concepts = {};
    for (const [key, slots] of Object.entries(schoolRuleMap[schoolId])) {
        concepts[key] = {
            displayLabel: conceptDisplayLabels[key] || key,
            slots
        };
    }

    res.json({
        id: schoolId,
        label: schoolLabels[schoolId] || schoolId,
        fullName: schoolFullNames[schoolId] || schoolId,
        concepts
    });
});

/**
 * PUT /api/admin/schools/:id
 * Create or update a school.
 * Body: { label, fullName, concepts: { 'concept key': { displayLabel, slots: [...] } } }
 */
app.put('/api/admin/schools/:id', verifyAdmin, async (req, res) => {
    const schoolId = req.params.id.trim().toUpperCase();

    if (!schoolId || schoolId.length > 20 || !/^[A-Z0-9_]+$/.test(schoolId)) {
        return res.status(400).json({ error: 'Invalid school ID — use uppercase letters, numbers, underscores (max 20 chars)' });
    }

    const { label, fullName, concepts } = req.body || {};

    if (!label || typeof label !== 'string') {
        return res.status(400).json({ error: 'Missing required field: "label"' });
    }

    if (concepts && typeof concepts !== 'object') {
        return res.status(400).json({ error: '"concepts" must be an object' });
    }

    // Validate each concept's slots reference real rules
    if (concepts) {
        for (const [conceptKey, conceptData] of Object.entries(concepts)) {
            if (!conceptData.slots || !Array.isArray(conceptData.slots)) {
                return res.status(400).json({ error: `Concept "${conceptKey}" must have a "slots" array` });
            }
            for (const slot of conceptData.slots) {
                if (!slot.ruleId || !slot.difficulty) {
                    return res.status(400).json({ error: `Each slot in "${conceptKey}" must have "ruleId" and "difficulty"` });
                }
                const rule = getRule(slot.ruleId);
                if (!rule) {
                    return res.status(400).json({ error: `Unknown rule "${slot.ruleId}" in concept "${conceptKey}"` });
                }
            }
        }
    }

    try {
        const doc = await dataLoader.saveSchool(schoolId, { label, fullName, concepts });
        res.json({ message: `School "${schoolId}" saved`, school: doc });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save school: ' + err.message });
    }
});

/**
 * DELETE /api/admin/schools/:id
 * Delete a school.
 */
app.delete('/api/admin/schools/:id', verifyAdmin, async (req, res) => {
    const schoolId = req.params.id.trim().toUpperCase();

    const schoolRuleMap = dataLoader.getSchoolRuleMap();
    if (!schoolRuleMap[schoolId]) {
        return res.status(404).json({ error: `School "${schoolId}" not found` });
    }

    try {
        await dataLoader.deleteSchool(schoolId);
        res.json({ message: `School "${schoolId}" deleted` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete school: ' + err.message });
    }
});

/**
 * PUT /api/admin/display-config
 * Update display config (explanations, titles, full names).
 * Body: { conceptExplanations?, conceptDisplayTitles?, schoolFullNames? }
 */
app.put('/api/admin/display-config', verifyAdmin, async (req, res) => {
    const { conceptExplanations, conceptDisplayTitles, schoolFullNames } = req.body || {};

    if (!conceptExplanations && !conceptDisplayTitles && !schoolFullNames) {
        return res.status(400).json({ error: 'Provide at least one of: conceptExplanations, conceptDisplayTitles, schoolFullNames' });
    }

    try {
        const doc = await dataLoader.saveDisplayConfig({
            conceptExplanations,
            conceptDisplayTitles,
            schoolFullNames
        });
        res.json({ message: 'Display config updated', config: doc });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update display config: ' + err.message });
    }
});

/**
 * PUT /api/admin/concept-labels
 * Update concept display labels.
 * Body: { labels: { 'number patterns': 'Number Patterns', ... } }
 */
app.put('/api/admin/concept-labels', verifyAdmin, async (req, res) => {
    const { labels } = req.body || {};

    if (!labels || typeof labels !== 'object' || Object.keys(labels).length === 0) {
        return res.status(400).json({ error: 'Provide "labels" object with at least one entry' });
    }

    try {
        await dataLoader.saveConceptLabels(labels);
        res.json({ message: 'Concept labels updated', labels });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update concept labels: ' + err.message });
    }
});

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================

// 404 for unknown API routes
app.use('/api/{*path}', (req, res) => {
    res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Catch-all error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error', {
        method: req.method,
        path: req.originalUrl,
        error: err.message,
        stack: NODE_ENV === 'development' ? err.stack : undefined
    });
    res.status(500).json({
        error: NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
});

// ============================================================================
// START SERVER (async — initialize data layer first)
// ============================================================================

async function startServer() {
    // Initialize the Firestore data layer (falls back to JSON if unavailable)
    await dataLoader.init();

    app.listen(PORT, '0.0.0.0', () => {
        const ds = dataLoader.getDataSource();
        logger.info(`NG Admissions API running`, {
            port: PORT,
            env: NODE_ENV,
            rules: listRuleIds().length,
            schools: ds.schools,
            dataSource: ds.source,
            url: `http://0.0.0.0:${PORT}`
        });
        logger.info(`Browser app: http://localhost:${PORT}/app.html`);
        logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });
}

startServer().catch(err => {
    logger.error('Failed to start server: %s', err.message);
    process.exit(1);
});

module.exports = app;  // for testing
