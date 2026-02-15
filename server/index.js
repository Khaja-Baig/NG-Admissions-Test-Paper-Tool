// ============================================================================
// EXPRESS API SERVER
// ============================================================================
//
// REST API that wraps the rule engine for SaaS consumption.
//
// Start:   npm start   (or  node server/index.js)
//
// Endpoints:
//   GET  /api/rules                     — list all rules (id, name, concept, tags, …)
//   GET  /api/rules/:id                 — single rule metadata
//   POST /api/rules/:id/generate        — generate a question  { difficulty?, params? }
//   GET  /api/schools                   — list all schools with labels
//   GET  /api/schools/:id/config        — full concept/slot config for a school
//   GET  /api/schools/:id/slots         — flat slot array (paper blueprint)
//   GET  /api/display-config            — conceptExplanations, titles, schoolFullNames
//   POST /api/papers/generate           — generate a full paper  { school }
//
// ============================================================================

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// --- Rule engine imports (CommonJS, same modules the browser bundle uses) ---
const { getRule, listRules, listRuleIds } = require('../rules/ruleRegistry');
const { schoolRuleMap, schoolLabels, getSlots, getConceptConfig, listSchools } = require('../rules/schoolRuleMap');
const displayConfig = require('../rules/displayConfig');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── Static files (serve the browser app) ────────────────────────────────────
app.use(express.static(path.join(__dirname, '..')));

// ============================================================================
// API ROUTES
// ============================================================================

// ---------- Rules -----------------------------------------------------------

/**
 * GET /api/rules
 * Returns an array of rule summaries.
 */
app.get('/api/rules', (req, res) => {
    const rules = listRules().map(r => ({
        id:          r.id,
        name:        r.name,
        description: r.description,
        concept:     r.concept,
        tags:        r.tags,
        gradeLevel:  r.gradeLevel,
        answerType:  r.answerType,
        difficulties: Object.keys(r.difficultyConfig || {})
    }));
    res.json({ rules });
});

/**
 * GET /api/rules/:id
 * Returns full metadata for a single rule.
 */
app.get('/api/rules/:id', (req, res) => {
    const rule = getRule(req.params.id);
    if (!rule) return res.status(404).json({ error: `Rule "${req.params.id}" not found` });

    res.json({
        id:          rule.id,
        name:        rule.name,
        description: rule.description,
        concept:     rule.concept,
        tags:        rule.tags,
        gradeLevel:  rule.gradeLevel,
        answerType:  rule.answerType,
        difficulties: Object.keys(rule.difficultyConfig || {})
    });
});

/**
 * POST /api/rules/:id/generate
 * Body (optional): { difficulty: 'easy', params: { ... } }
 * Returns a generated question + answer.
 */
app.post('/api/rules/:id/generate', (req, res) => {
    const rule = getRule(req.params.id);
    if (!rule) return res.status(404).json({ error: `Rule "${req.params.id}" not found` });

    try {
        const { difficulty, params } = req.body || {};
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

// ---------- Schools ---------------------------------------------------------

/**
 * GET /api/schools
 * Returns the list of schools with labels.
 */
app.get('/api/schools', (req, res) => {
    const schools = listSchools().map(s => ({
        id:    s,
        label: schoolLabels[s] || s
    }));
    res.json({ schools });
});

/**
 * GET /api/schools/:id/config
 * Returns the concept configuration for a school (for dropdown population).
 */
app.get('/api/schools/:id/config', (req, res) => {
    const config = getConceptConfig(req.params.id);
    if (!config) return res.status(404).json({ error: `School "${req.params.id}" not found` });
    res.json({ school: req.params.id, concepts: config });
});

/**
 * GET /api/schools/:id/slots
 * Returns the flat slot array (paper blueprint) for a school.
 */
app.get('/api/schools/:id/slots', (req, res) => {
    const slots = getSlots(req.params.id);
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
        conceptExplanations:  displayConfig.conceptExplanations,
        conceptDisplayTitles: displayConfig.conceptDisplayTitles,
        schoolFullNames:      displayConfig.schoolFullNames
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
app.post('/api/papers/generate', (req, res) => {
    const { school } = req.body || {};

    if (!school) {
        return res.status(400).json({ error: 'Missing required field: "school"' });
    }

    const slots = getSlots(school);
    if (!slots) {
        return res.status(404).json({ error: `School "${school}" not found. Valid: ${listSchools().join(', ')}` });
    }

    const schoolLabel = schoolLabels[school] || school;
    const schoolFullName = displayConfig.schoolFullNames[school] || schoolLabel;

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

            // Track concept order (first occurrence)
            if (!conceptSeen[slot.concept]) {
                conceptSeen[slot.concept] = true;
                conceptOrder.push(slot.concept);
            }

            questions.push({
                slotLabel:   slot.label,
                concept:     slot.concept,
                ruleId:      slot.ruleId,
                ruleName:    rule.name,
                difficulty:  slot.difficulty,
                answerType:  rule.answerType,
                questionData: generated.questionData,
                answer:      generated.answer,
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
    for (const q of questions) {
        if (!byConcept[q.concept]) {
            byConcept[q.concept] = {
                conceptTitle: displayConfig.conceptDisplayTitles[q.concept] || q.concept,
                explanation:  displayConfig.conceptExplanations[q.concept] || [],
                questions:    []
            };
        }
        byConcept[q.concept].questions.push(q);
    }

    res.json({
        school:         school,
        schoolLabel:    schoolLabel,
        schoolFullName: schoolFullName,
        totalQuestions:  questions.length,
        conceptOrder:   conceptOrder,
        concepts:       byConcept,
        // Flat array for easy iteration
        allQuestions:   questions
    });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
    console.log(`\n🚀 NG Admissions API running on http://localhost:${PORT}`);
    console.log(`   API docs:  GET /api/rules, /api/schools, /api/display-config`);
    console.log(`   Browser:   http://localhost:${PORT}/app.html\n`);
});

module.exports = app;  // for testing
