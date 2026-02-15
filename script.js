// ========================================
// UTILITY ALIASES  (loaded from rules-bundle.js → window.RuleEngine)
// ========================================
// All shared utilities now live in rules/utils.js and rules/mcqHelpers.js.
// They are bundled into RuleEngine and aliased here for convenience.

const randomInt              = RuleEngine.randomInt;
const hasTrailingZeros       = RuleEngine.hasTrailingZeros;
const shuffle                = RuleEngine.shuffle;
const generateDistractors    = RuleEngine.generateDistractors;
const createOptions          = RuleEngine.createOptions;
const generateMCQOptions     = RuleEngine.generateMCQOptions;
const shuffleOptionsWithAnswer = RuleEngine.shuffleOptionsWithAnswer;

// ========================================
// RULE ENGINE (loaded via rules-bundle.js → window.RuleEngine)
// ========================================
// RuleEngine.getRule(ruleId)        — get a rule object
// RuleEngine.getSlots(school)       — flat array of { concept, ruleId, difficulty, label }
// RuleEngine.getConceptConfig(school) — concept → { label, slots[] } for dropdowns
// RuleEngine.schoolLabels           — { SOP: 'School of Programming (SOP)', ... }
// RuleEngine.schoolRuleMap          — full mapping
// ========================================

// ========================================
// CASCADING DROPDOWN FUNCTIONS
// ========================================

// Update Concept dropdown based on selected School
function updateConceptDropdown() {
    const schoolKey = document.getElementById('school').value;
    const conceptSelect = document.getElementById('concept');
    const conceptConfig = RuleEngine.getConceptConfig(schoolKey) || {};

    conceptSelect.innerHTML = '';

    Object.keys(conceptConfig).forEach(conceptKey => {
        const option = document.createElement('option');
        option.value = conceptKey;
        option.textContent = conceptConfig[conceptKey].label;
        conceptSelect.appendChild(option);
    });

    // Cascade: update difficulty for the first concept
    updateDifficultyDropdown();
}

// Update Difficulty dropdown based on selected School + Concept
// Each option value is the slot index within the concept's slots array,
// which maps to a specific ruleId + difficulty key.
function updateDifficultyDropdown() {
    const schoolKey = document.getElementById('school').value;
    const conceptKey = document.getElementById('concept').value;
    const difficultySelect = document.getElementById('difficulty');

    const conceptConfig = RuleEngine.getConceptConfig(schoolKey);
    const slots = conceptConfig?.[conceptKey]?.slots || [];

    difficultySelect.innerHTML = '';

    slots.forEach((slot, idx) => {
        const option = document.createElement('option');
        // Store ruleId|difficulty as the value so generateQuestions can look it up
        option.value = `${slot.ruleId}|${slot.difficulty}`;
        option.textContent = slot.label;
        difficultySelect.appendChild(option);
    });
}

// ========================================
// MAIN GENERATION FUNCTION
// ========================================

function generateQuestions() {
    const school = document.getElementById('school').value;
    const concept = document.getElementById('concept').value;
    const difficultyValue = document.getElementById('difficulty').value; // "ruleId|difficulty"
    const count = parseInt(document.getElementById('count').value);

    if (!count || count < 1) {
        alert('Please enter a valid number of questions (minimum 1)');
        return;
    }

    // Parse the ruleId and difficulty key from the dropdown value
    const [ruleId, difficultyKey] = difficultyValue.split('|');
    const rule = RuleEngine.getRule(ruleId);
    if (!rule) {
        alert(`Rule "${ruleId}" not found in the rule engine.`);
        return;
    }

    const questions = [];
    let attempts = 0;
    const maxAttempts = count * 50;

    while (questions.length < count && attempts < maxAttempts) {
        attempts++;
        try {
            const { questionData, answer } = rule.generateForDifficulty(difficultyKey);
            const questionText = rule.formatQuestion(questionData);

            // Build a result object compatible with displayQuestions
            const result = {
                question: questionText,
                answer: typeof answer === 'object' ? null : answer,     // numeric answer (null for MCQ)
                isMCQ: !!questionData.isMCQ,
                correctAnswer: null,
                type: questionData.type || null,
                ruleId: ruleId,
                questionData: questionData  // keep for MCQ option generation
            };

            // For MCQ rules (leCashierNotes, leNotebookPenCombo), build correctAnswer string
            if (questionData.isMCQ && answer && typeof answer === 'object') {
                // Reconstruct the correctAnswer string from answer data + labels
                if (answer.count1 != null && answer.count2 != null) {
                    const l1 = questionData.label1 || 'type 1';
                    const l2 = questionData.label2 || 'type 2';
                    result.correctAnswer = `${answer.count1} of ${l1} and ${answer.count2} of ${l2}`;
                } else if (answer.notebooks != null && answer.pens != null) {
                    result.correctAnswer = `${answer.notebooks} notebooks and ${answer.pens} pens`;
                }
            }

            questions.push(result);
        } catch (e) {
            // Generation can occasionally fail (constraints not met) — retry
            continue;
        }
    }

    if (questions.length === 0) {
        alert('Unable to generate questions. Please try different parameters.');
        return;
    }

    const schoolLabel = RuleEngine.schoolLabels[school] || school;
    displayQuestions(questions, concept, ruleId, difficultyKey, schoolLabel);
}

// ========================================
// DISPLAY FUNCTIONS
// ========================================

function displayQuestions(questions, concept, ruleId, difficultyKey, schoolLabel) {
    const output = document.getElementById('output');
    const questionCount = document.getElementById('questionCount');
    
    questionCount.textContent = `${questions.length} Questions`;
    
    // Store the raw generated questions with their pre-computed options for later selection
    window.generatedQuestionsRaw = [];
    
    let html = '';
    const answerKey = [];
    const hasActivePaper = !!activePaperId;

    questions.forEach((q, index) => {
        const qNum = index + 1;
        
        // Pre-compute options so they are stable (stored for Add-to-Paper)
        let displayOptions = [];
        let correctLetter = '';

        if (q.isMCQ) {
            const options = generateMCQOptions(q.correctAnswer);
            const shuffled = shuffleOptionsWithAnswer(options, q.correctAnswer);
            displayOptions = shuffled.options.map((opt, i) => {
                return { letter: String.fromCharCode(65 + i), text: opt };
            });
            correctLetter = shuffled.correctLetter;
        } else {
            const { options, correctLetter: cl } = createOptions(q.answer);
            correctLetter = cl;
            displayOptions = options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                let displayOpt = opt;
                if (q.type && opt === q.answer) {
                    displayOpt = `${q.type.charAt(0).toUpperCase() + q.type.slice(1)} of ₹${opt}`;
                } else if (q.type) {
                    const randType = Math.random() < 0.5 ? 'Profit' : 'Loss';
                    displayOpt = `${randType} of ₹${opt}`;
                }
                return { letter, text: displayOpt };
            });
        }

        // Save for later use when adding to paper
        window.generatedQuestionsRaw.push({
            ...q,
            concept,
            ruleId: q.ruleId || ruleId,
            difficulty: difficultyKey,
            school: document.getElementById('school').value,
            displayOptions,
            correctLetter
        });

        html += `<div class="question-block" data-index="${index}">`;
        html += `<div class="question-select-row">`;
        if (hasActivePaper) {
            html += `<input type="checkbox" class="question-checkbox" data-index="${index}" onchange="updateSelectedCount()">`;
        }
        html += `<div class="question-number">Question ${qNum}.</div>`;
        html += `</div>`;
        html += `<p>${q.question.replace(/\n/g, '<br>')}</p><br>`;

        displayOptions.forEach(opt => {
            html += `<div class="option">${opt.letter}) ${opt.text}</div>`;
        });

        answerKey.push(`${qNum}. ${correctLetter}`);
        html += `</div>`;
    });

    // Add answer key
    html += `<div class="answer-key">`;
    html += `<div class="answer-key-title">Answer Key</div>`;
    answerKey.forEach(answer => {
        html += `<div>${answer}</div>`;
    });
    html += `</div>`;

    output.innerHTML = html;
    document.getElementById('downloadBtn').disabled = false;

    // Show/hide select-all row and add-to-paper bar
    const selectAllRow = document.getElementById('selectAllRow');
    const addToPaperBar = document.getElementById('addToPaperBar');
    if (hasActivePaper) {
        selectAllRow.classList.add('visible');
        addToPaperBar.classList.add('visible');
        document.getElementById('selectAllCheckbox').checked = false;
        updateSelectedCount();
    } else {
        selectAllRow.classList.remove('visible');
        addToPaperBar.classList.remove('visible');
    }

    // Store for PDF generation (existing flow)
    window.currentQuestions = { questions, concept, ruleId, difficulty: difficultyKey, answerKey, schoolLabel };
}

// ========================================
// PDF DOWNLOAD
// ========================================

function downloadPDF() {
    if (!window.currentQuestions) {
        alert('Please generate questions first');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const { questions, concept, difficulty, answerKey, schoolLabel } = window.currentQuestions;
    
    let y = 20;
    const lineHeight = 7;
    const pageHeight = 280;

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Question Generator - Admissions NG ST', 105, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`School: ${schoolLabel}`, 20, y);
    y += 7;
    doc.text(`Concept: ${concept}`, 20, y);
    y += 7;
    doc.text(`Difficulty: ${difficulty}`, 20, y);
    y += 15;

    // Questions
    questions.forEach((q, index) => {
        if (y > pageHeight) {
            doc.addPage();
            y = 20;
        }

        doc.setFont(undefined, 'bold');
        doc.text(`Question ${index + 1}.`, 20, y);
        y += lineHeight;

        doc.setFont(undefined, 'normal');
        const questionLines = doc.splitTextToSize(q.question, 170);
        questionLines.forEach(line => {
            if (y > pageHeight) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, 20, y);
            y += lineHeight;
        });

        y += 3;

        if (q.isMCQ) {
            const options = generateMCQOptions(q.correctAnswer);
            const { options: shuffledOpts } = shuffleOptionsWithAnswer(options, q.correctAnswer);
            
            shuffledOpts.forEach((opt, i) => {
                if (y > pageHeight) {
                    doc.addPage();
                    y = 20;
                }
                const letter = String.fromCharCode(65 + i);
                doc.text(`${letter}) ${opt}`, 25, y);
                y += lineHeight;
            });
        } else {
            const { options } = createOptions(q.answer);
            
            options.forEach((opt, i) => {
                if (y > pageHeight) {
                    doc.addPage();
                    y = 20;
                }
                const letter = String.fromCharCode(65 + i);
                let displayOpt = opt;
                
                if (q.type && opt === q.answer) {
                    displayOpt = `${q.type.charAt(0).toUpperCase() + q.type.slice(1)} of ₹${opt}`;
                } else if (q.type) {
                    const randType = Math.random() < 0.5 ? 'Profit' : 'Loss';
                    displayOpt = `${randType} of ₹${opt}`;
                }
                
                doc.text(`${letter}) ${displayOpt}`, 25, y);
                y += lineHeight;
            });
        }

        y += 10;
    });

    // Answer Key
    if (y > pageHeight - 50) {
        doc.addPage();
        y = 20;
    }

    y += 10;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text('Answer Key', 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    answerKey.forEach(answer => {
        if (y > pageHeight) {
            doc.addPage();
            y = 20;
        }
        doc.text(answer, 20, y);
        y += lineHeight;
    });

    doc.save('questions.pdf');
}

// ========================================
// QUESTION PAPER MANAGEMENT
// ========================================

// In-memory storage for all question papers
let questionPapers = {};
let activePaperId = null;

// Concept order per school (derived from RuleEngine.schoolRuleMap key order)
function getConceptOrder(school) {
    const map = RuleEngine.schoolRuleMap[school];
    return map ? Object.keys(map) : [];
}

// ========================================
// PAPER PROGRESS COMPUTATION
// ========================================

/**
 * Computes the fill-status of every blueprint slot for the given paper.
 * Uses RuleEngine.getSlots() instead of old paperBlueprint.
 * Returns an object keyed by concept, each containing:
 *   { label, required: number, filled: number, slots: [{ difficulty, label, filled: bool }] }
 */
function computePaperProgress(paper) {
    const blueprint = RuleEngine.getSlots(paper.school);
    if (!blueprint) return null;

    // Count how many questions exist per concept+ruleId
    const counts = {};
    paper.questions.forEach(q => {
        const key = `${q.concept}|||${q.ruleId}`;
        counts[key] = (counts[key] || 0) + 1;
    });

    // Group blueprint slots by concept (preserving order)
    const conceptOrder = [];
    const conceptMap = {};

    blueprint.forEach(slot => {
        if (!conceptMap[slot.concept]) {
            conceptMap[slot.concept] = { slots: [], filled: 0, required: 0 };
            conceptOrder.push(slot.concept);
        }
        const key = `${slot.concept}|||${slot.ruleId}`;
        const isFilled = (counts[key] || 0) >= 1;
        conceptMap[slot.concept].slots.push({
            ruleId: slot.ruleId,
            difficulty: slot.difficulty,
            label: slot.label,
            filled: isFilled,
            count: counts[key] || 0
        });
        conceptMap[slot.concept].required++;
        if (isFilled) conceptMap[slot.concept].filled++;
    });

    return { conceptOrder, conceptMap };
}

/**
 * Checks if a specific concept+ruleId slot is already filled in the given paper.
 * Returns the count of questions already in that slot.
 */
function getSlotCount(paper, concept, ruleId) {
    return paper.questions.filter(q => q.concept === concept && q.ruleId === ruleId).length;
}

// Concept explanation texts for the PDF (matching reference papers)
// Each concept has an array of paragraphs. Blank string '' = blank line in PDF.
const conceptExplanations = {
    'number patterns': [], // No explanation — questions start immediately after separator
    'percentages': [
        'A percentage helps us understand how much a part is of the whole.',
        'The word "percent" means "out of 100."',
        '',
        'For example, if a school has 50 students and 10 of them are unhealthy, then the percentage of unhealthy students will be:',
        '',
        'Percentage = (Part \u00F7 Total) \u00D7 100',
        '       = (10 \u00F7 50) \u00D7 100 = 20%',
        '',
        'Now answer the following questions.'
    ],
    'work and time': [
        'For the next questions, think in a practical way. For example, if you can plant 100 trees in 1 hour, then in 4 hours you can plant: 100 \u00D7 4 = 400 trees.',
        '',
        'This means the work done increases with time.',
        '',
        'Using the same idea, answer the following questions.'
    ],
    'linear equations in two variables': [
        'Think of these questions like real-life situations. Two values are unknown. Use letters like x and y to represent them. Then use the given information to write an equation.',
        '',
        'Example:',
        'If the total cost of apples and oranges is Rs.100, and apples cost Rs.3 each while oranges cost Rs.2 each, the equation can be written as:',
        '3x + 2y = 100',
        '',
        'Now answer the following questions.'
    ],
    'profit and loss': [
        'Profit and loss help us understand buying and selling things.',
        '',
        '   \u2022  Cost price (CP) is the price at which something is bought.',
        '   \u2022  Selling price (SP) is the price at which something is sold.',
        '',
        'If we sell something for more money than we bought it for, we get profit.',
        'If we sell it for less money than we bought it for, we get loss.',
        '',
        'Now answer the following questions.'
    ],
    'simple interest': [
        'Simple interest is the extra money paid or earned on a fixed amount for a fixed time at a fixed rate.',
        '',
        'Simple Interest = Principal \u00D7 Rate \u00D7 Time \u00F7 100',
        '',
        '   \u2022  Principal (P) is the amount of money we first take or invest.',
        '   \u2022  The Rate of interest (R) is the percentage of interest per year.',
        '   \u2022  Time (T) means how many years the money is taken/lent for.',
        '',
        'Now answer the following questions.'
    ]
};

// Concept display titles for the PDF
const conceptDisplayTitles = {
    'number patterns': 'Number Patterns',
    'percentages': 'Percentages',
    'work and time': 'Work and Time',
    'linear equations in two variables': 'Linear Equations in Two Variables',
    'profit and loss': 'Profit and Loss',
    'simple interest': 'Simple Interest'
};

// Full school names for the PDF header
const schoolFullNames = {
    'SOP': 'School Of Programming',
    'SOB': 'School Of Business',
    'SOF': 'School Of Finance',
    'BCA': 'BCA'
};

// ========================================
// TAB SWITCHING
// ========================================

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

    if (tabName === 'generate') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('tab-generate').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('tab-papers').classList.add('active');
        renderPaperList();
        renderActivePaper();
    }
}

// ========================================
// PAPER CRUD
// ========================================

function createPaper() {
    const schoolKey = document.getElementById('paperSchool').value;
    const setName = document.getElementById('paperSetName').value.trim();

    if (!setName) {
        alert('Please enter a set name (e.g. A, B, C)');
        return;
    }

    const paperId = `${schoolKey} ${setName}`;

    if (questionPapers[paperId]) {
        alert(`Paper "${paperId}" already exists.`);
        return;
    }

    questionPapers[paperId] = {
        school: schoolKey,
        setName: setName,
        questions: [] // Each entry: { concept, difficulty, question, answer, isMCQ, correctAnswer, type, displayOptions, correctLetter }
    };

    activePaperId = paperId;
    document.getElementById('paperSetName').value = '';

    renderPaperList();
    renderActivePaper();
    updateActivePaperLabelEverywhere();
}

function deletePaper(paperId) {
    if (!confirm(`Delete paper "${paperId}"?`)) return;
    delete questionPapers[paperId];
    if (activePaperId === paperId) {
        activePaperId = null;
    }
    renderPaperList();
    renderActivePaper();
    updateActivePaperLabelEverywhere();
}

function setActivePaper(paperId) {
    activePaperId = paperId;
    renderPaperList();
    renderActivePaper();
    updateActivePaperLabelEverywhere();
}

function updateActivePaperLabelEverywhere() {
    const label = document.getElementById('activePaperLabel');
    if (label) {
        label.textContent = activePaperId || 'None';
    }
    // Update the add-to-paper bar visibility if questions are displayed
    const addToPaperBar = document.getElementById('addToPaperBar');
    const selectAllRow = document.getElementById('selectAllRow');
    if (activePaperId && window.generatedQuestionsRaw && window.generatedQuestionsRaw.length > 0) {
        addToPaperBar.classList.add('visible');
        selectAllRow.classList.add('visible');
        // Add checkboxes to existing question blocks if missing
        document.querySelectorAll('.question-block').forEach(block => {
            const row = block.querySelector('.question-select-row');
            if (row && !row.querySelector('.question-checkbox')) {
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.className = 'question-checkbox';
                cb.dataset.index = block.dataset.index;
                cb.onchange = updateSelectedCount;
                row.insertBefore(cb, row.firstChild);
            }
        });
        updateSelectedCount();
    } else {
        addToPaperBar.classList.remove('visible');
        selectAllRow.classList.remove('visible');
    }
}

// ========================================
// PAPER LIST RENDERING
// ========================================

function renderPaperList() {
    const container = document.getElementById('paperList');
    if (!container) return;

    const ids = Object.keys(questionPapers);
    if (ids.length === 0) {
        container.innerHTML = '<span style="color:var(--text-secondary); font-style:italic; font-size:0.9rem;">No papers created yet.</span>';
        return;
    }

    let html = '';
    ids.forEach(id => {
        const isActive = id === activePaperId;
        const qCount = questionPapers[id].questions.length;
        html += `<div class="paper-chip ${isActive ? 'active' : ''}" onclick="setActivePaper('${id.replace(/'/g, "\\'")}')">`;
        html += `${id} (${qCount}Q)`;
        html += `<button class="delete-paper" onclick="event.stopPropagation(); deletePaper('${id.replace(/'/g, "\\'")}')">×</button>`;
        html += `</div>`;
    });
    container.innerHTML = html;
}

// ========================================
// ACTIVE PAPER RENDERING
// ========================================

function renderActivePaper() {
    const placeholder = document.getElementById('noPaperPlaceholder');
    const contents = document.getElementById('activePaperContents');

    if (!activePaperId || !questionPapers[activePaperId]) {
        placeholder.style.display = '';
        contents.style.display = 'none';
        return;
    }

    placeholder.style.display = 'none';
    contents.style.display = '';

    const paper = questionPapers[activePaperId];
    const schoolLabel = RuleEngine.schoolLabels[paper.school] || paper.school;

    document.getElementById('activePaperTitleDisplay').textContent = `${activePaperId} — ${schoolLabel}`;

    // Compute blueprint progress
    const progress = computePaperProgress(paper);
    const blueprint = RuleEngine.getSlots(paper.school);
    const totalRequired = blueprint ? blueprint.length : 0;
    const totalFilled = progress ? progress.conceptOrder.reduce((sum, c) => sum + progress.conceptMap[c].filled, 0) : 0;

    document.getElementById('activePaperStats').textContent = `${paper.questions.length} questions · ${totalFilled}/${totalRequired} slots filled`;

    // ---- Render progress grid ----
    const progressContainer = document.getElementById('paperProgressGrid');
    if (progressContainer && progress) {
        let progressHtml = '';

        // Summary bar
        const summaryClass = totalFilled === totalRequired ? 'all-done' : (totalFilled > 0 ? 'in-progress' : 'not-started');
        const summaryIcon = totalFilled === totalRequired ? '✅ Paper Complete' : (totalFilled > 0 ? '⚠️ In Progress' : '❌ Empty');
        progressHtml += `<div class="progress-summary">`;
        progressHtml += `<span class="progress-summary-total">Slots: ${totalFilled} / ${totalRequired}</span>`;
        progressHtml += `<span class="progress-summary-status ${summaryClass}">${summaryIcon}</span>`;
        progressHtml += `</div>`;

        // Grid of concept cards
        progressHtml += `<div class="progress-grid">`;
        progress.conceptOrder.forEach(conceptKey => {
            const info = progress.conceptMap[conceptKey];
            const conceptLabel = conceptDisplayTitles[conceptKey] || conceptKey;
            const statusClass = info.filled === info.required ? 'status-complete' : (info.filled > 0 ? 'status-partial' : 'status-empty');
            const statusIcon = info.filled === info.required ? '✅' : (info.filled > 0 ? '⚠️' : '❌');

            progressHtml += `<div class="progress-card ${statusClass}">`;
            progressHtml += `<div class="progress-card-header">`;
            progressHtml += `<span class="progress-card-title">${conceptLabel}</span>`;
            progressHtml += `<span class="progress-card-count">${info.filled}/${info.required} ${statusIcon}</span>`;
            progressHtml += `</div>`;
            progressHtml += `<div class="progress-slots">`;
            info.slots.forEach(slot => {
                const slotClass = slot.count > 1 ? 'overfilled' : (slot.filled ? 'filled' : 'empty');
                const slotIcon = slot.count > 1 ? `⚠️ ${slot.count}` : (slot.filled ? '✓' : '✗');
                progressHtml += `<span class="progress-slot ${slotClass}">${slot.label}: ${slotIcon}</span>`;
            });
            progressHtml += `</div>`;
            progressHtml += `</div>`;
        });
        progressHtml += `</div>`;

        progressContainer.innerHTML = progressHtml;
    } else if (progressContainer) {
        progressContainer.innerHTML = '';
    }

    // Group questions by concept, maintaining the order from schoolRuleMap
    const order = getConceptOrder(paper.school);
    const grouped = {};
    paper.questions.forEach(q => {
        if (!grouped[q.concept]) grouped[q.concept] = [];
        grouped[q.concept].push(q);
    });

    const container = document.getElementById('paperQuestionsContainer');
    let html = '';
    let globalNum = 1;

    order.forEach(conceptKey => {
        const qs = grouped[conceptKey];
        if (!qs || qs.length === 0) return;

        const conceptLabel = conceptDisplayTitles[conceptKey] || conceptKey;
        html += `<div class="paper-concept-section">`;
        html += `<div class="paper-concept-title">${conceptLabel} (${qs.length})</div>`;

        qs.forEach((q, idx) => {
            const diffLabel = q.difficulty;
            html += `<div class="paper-question-item">`;
            html += `<div class="pq-content">`;
            html += `<strong>Q${globalNum}.</strong> ${q.question.replace(/\n/g, '<br>')}`;
            html += `<div class="pq-meta">${diffLabel}</div>`;

            // Show options
            if (q.displayOptions && q.displayOptions.length > 0) {
                q.displayOptions.forEach(opt => {
                    html += `<div class="option">${opt.letter}) ${opt.text}</div>`;
                });
            }

            html += `</div>`;
            html += `<button class="remove-q-btn" onclick="removeQuestionFromPaper('${activePaperId.replace(/'/g, "\\'")}', ${paper.questions.indexOf(q)})">Remove</button>`;
            html += `</div>`;
            globalNum++;
        });

        html += `</div>`;
    });

    // Also show any questions whose concept is not in the order list (edge case)
    Object.keys(grouped).forEach(conceptKey => {
        if (order.includes(conceptKey)) return;
        const qs = grouped[conceptKey];
        const conceptLabel = conceptDisplayTitles[conceptKey] || conceptKey;
        html += `<div class="paper-concept-section">`;
        html += `<div class="paper-concept-title">${conceptLabel} (${qs.length})</div>`;
        qs.forEach(q => {
            html += `<div class="paper-question-item">`;
            html += `<div class="pq-content">`;
            html += `<strong>Q${globalNum}.</strong> ${q.question.replace(/\n/g, '<br>')}`;
            html += `<div class="pq-meta">${q.difficulty}</div>`;
            if (q.displayOptions && q.displayOptions.length > 0) {
                q.displayOptions.forEach(opt => {
                    html += `<div class="option">${opt.letter}) ${opt.text}</div>`;
                });
            }
            html += `</div>`;
            html += `<button class="remove-q-btn" onclick="removeQuestionFromPaper('${activePaperId.replace(/'/g, "\\'")}', ${paper.questions.indexOf(q)})">Remove</button>`;
            html += `</div>`;
            globalNum++;
        });
        html += `</div>`;
    });

    if (paper.questions.length === 0) {
        html = '<div class="no-paper-placeholder"><p>No questions added yet. Go to "Generate Questions" tab, generate questions, select the ones you want, and click "Add to Paper".</p></div>';
    }

    container.innerHTML = html;
}

function removeQuestionFromPaper(paperId, index) {
    if (!questionPapers[paperId]) return;
    questionPapers[paperId].questions.splice(index, 1);
    renderPaperList();
    renderActivePaper();
}

// ========================================
// CHECKBOX / SELECTION HELPERS
// ========================================

function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('#output .question-checkbox');
    const checked = document.querySelectorAll('#output .question-checkbox:checked');
    document.getElementById('selectedCount').textContent = checked.length;
}

function toggleSelectAll(masterCheckbox) {
    const checkboxes = document.querySelectorAll('#output .question-checkbox');
    checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
    updateSelectedCount();
}

function addSelectedToPaper() {
    if (!activePaperId || !questionPapers[activePaperId]) {
        alert('No active paper. Create or select a paper first.');
        return;
    }

    const checked = document.querySelectorAll('#output .question-checkbox:checked');
    if (checked.length === 0) {
        alert('No questions selected.');
        return;
    }

    const paper = questionPapers[activePaperId];
    const blueprint = RuleEngine.getSlots(paper.school);

    // Block adding questions from a different school
    const currentGenerateSchool = document.getElementById('school').value;
    if (currentGenerateSchool !== paper.school) {
        const genLabel = RuleEngine.schoolLabels[currentGenerateSchool] || currentGenerateSchool;
        const paperLabel = RuleEngine.schoolLabels[paper.school] || paper.school;
        alert(`❌ School mismatch!\n\nYou are generating questions for "${genLabel}" but the active paper "${activePaperId}" belongs to "${paperLabel}".\n\nSwitch to a ${paper.school} paper, or generate questions for ${paper.school}.`);
        return;
    }

    // Collect selected questions
    const selectedQuestions = [];
    checked.forEach(cb => {
        const idx = parseInt(cb.dataset.index);
        const q = window.generatedQuestionsRaw[idx];
        if (q) selectedQuestions.push(q);
    });

    // Validate against blueprint: warn about slots that are already filled or not in blueprint
    const warnings = [];
    let addedCount = 0;
    const skipped = [];

    selectedQuestions.forEach(q => {
        if (blueprint) {
            // Check if this concept+ruleId is a valid slot in the blueprint
            const isValidSlot = blueprint.some(s => s.concept === q.concept && s.ruleId === q.ruleId);
            if (!isValidSlot) {
                warnings.push(`"${q.concept} / ${q.ruleId}" is not a required slot for ${paper.school}.`);
            }
            // Check if the slot is already filled
            const currentCount = getSlotCount(paper, q.concept, q.ruleId);
            if (currentCount >= 1) {
                warnings.push(`Slot "${q.concept} / ${q.ruleId}" already has ${currentCount} question(s). Adding another will overfill it.`);
            }
        }

        // Add to paper regardless (soft warning, not blocking)
        paper.questions.push({
            concept: q.concept,
            ruleId: q.ruleId,
            difficulty: q.difficulty,
            question: q.question,
            answer: q.answer,
            isMCQ: q.isMCQ || false,
            correctAnswer: q.correctAnswer || null,
            type: q.type || null,
            displayOptions: q.displayOptions,
            correctLetter: q.correctLetter
        });
        addedCount++;
    });

    // Uncheck all
    document.querySelectorAll('#output .question-checkbox').forEach(cb => cb.checked = false);
    document.getElementById('selectAllCheckbox').checked = false;
    updateSelectedCount();

    // Update paper list chip counts and re-render active paper (updates progress grid)
    renderPaperList();
    renderActivePaper();

    // Show result
    if (warnings.length > 0) {
        const uniqueWarnings = [...new Set(warnings)];
        alert(`${addedCount} question(s) added to "${activePaperId}".\n\n⚠️ Warnings:\n• ${uniqueWarnings.join('\n• ')}`);
    } else {
        alert(`${addedCount} question(s) added to "${activePaperId}".`);
    }
}

// ========================================
// QUESTION PAPER PDF GENERATOR
// ========================================

function downloadQuestionPaperPDF() {
    if (!activePaperId || !questionPapers[activePaperId]) {
        alert('No active paper selected.');
        return;
    }

    const paper = questionPapers[activePaperId];
    if (paper.questions.length === 0) {
        alert('The paper has no questions. Add some first.');
        return;
    }

    // Helper: replace ₹ with Rs. for PDF (Helvetica doesn't support U+20B9)
    function pdfSafe(text) {
        if (text === null || text === undefined) return '';
        return String(text).replace(/\u20B9/g, 'Rs.');
    }

    const { jsPDF } = window.jspdf;
    // Letter size (612 x 792 pt ≈ 215.9 x 279.4 mm) to match reference PDFs
    const doc = new jsPDF({ format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();   // ~215.9
    const pageHeight = doc.internal.pageSize.getHeight();  // ~279.4
    const marginLeft = 25;
    const marginRight = 25;
    const marginBottom = 20;
    const contentWidth = pageWidth - marginLeft - marginRight;
    const lineHeight = 5.5;
    let y = 22;

    // ---- Pagination helper ----
    function checkPage(needed) {
        if (y + needed > pageHeight - marginBottom) {
            doc.addPage();
            y = 22;
        }
    }

    // ---- Separator line ----
    function drawSeparator() {
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.4);
        doc.line(marginLeft, y, pageWidth - marginRight, y);
        y += 5;
    }

    // ---- HEADER ----
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('NavGurukul \u2013 Screening Test', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(13);
    const schoolName = schoolFullNames[paper.school] || paper.school;
    doc.text(schoolName, pageWidth / 2, y, { align: 'center' });
    y += 9;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`${paper.school} - ${paper.setName}`, pageWidth / 2, y, { align: 'center' });
    y += 12;

    // ---- INSTRUCTIONS ----
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Instructions', marginLeft, y);
    y += 7;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const instructions = [
        '\u2022  All questions are multiple-choice.',
        '\u2022  Choose only one correct answer for each question.',
        '\u2022  Mark the correct answer on the OMR sheet.'
    ];
    instructions.forEach(line => {
        doc.text(line, marginLeft, y);
        y += lineHeight + 0.5;
    });
    y += 4;

    // ---- QUESTIONS BY CONCEPT SECTION ----
    const order = getConceptOrder(paper.school);
    const grouped = {};
    paper.questions.forEach(q => {
        if (!grouped[q.concept]) grouped[q.concept] = [];
        grouped[q.concept].push(q);
    });

    let globalQNum = 1;

    // Collect all concepts in order (+ any extras)
    const allConcepts = [...order];
    Object.keys(grouped).forEach(c => {
        if (!allConcepts.includes(c)) allConcepts.push(c);
    });

    allConcepts.forEach(conceptKey => {
        const qs = grouped[conceptKey];
        if (!qs || qs.length === 0) return;

        // Separator before every concept section
        checkPage(20);
        drawSeparator();

        // Number patterns: NO concept title, NO explanation — questions start right away
        const isNumberPatterns = (conceptKey === 'number patterns');

        if (!isNumberPatterns) {
            // Concept title
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            const conceptTitle = conceptDisplayTitles[conceptKey] || conceptKey;
            doc.text(conceptTitle, marginLeft, y);
            y += 7;

            // Concept explanation (array of paragraphs)
            const paragraphs = conceptExplanations[conceptKey] || [];
            if (paragraphs.length > 0) {
                doc.setFontSize(9.5);
                doc.setFont(undefined, 'normal');
                paragraphs.forEach(para => {
                    if (para === '') {
                        // Blank line
                        y += lineHeight * 0.6;
                    } else {
                        const wrapped = doc.splitTextToSize(pdfSafe(para), contentWidth);
                        wrapped.forEach(line => {
                            checkPage(lineHeight);
                            doc.text(line, marginLeft, y);
                            y += lineHeight;
                        });
                    }
                });
                y += 3;
            }
        }

        // Questions
        qs.forEach(q => {
            // Estimate space: question + options ≈ 25
            checkPage(25);

            // Q number + question text on SAME line
            // "Q1    question text here..."
            doc.setFontSize(10.5);
            doc.setFont(undefined, 'bold');
            const qLabel = `Q${globalQNum}   `;
            const qLabelWidth = doc.getTextWidth(qLabel);

            doc.text(qLabel, marginLeft, y);

            doc.setFont(undefined, 'normal');
            const questionText = pdfSafe(q.question);
            const availWidth = contentWidth - qLabelWidth;
            const qLines = doc.splitTextToSize(questionText, availWidth);
            // First line on same row as Q label
            if (qLines.length > 0) {
                doc.text(qLines[0], marginLeft + qLabelWidth, y);
                y += lineHeight;
            }
            // Remaining lines indented to align with first line of text
            for (let i = 1; i < qLines.length; i++) {
                checkPage(lineHeight);
                doc.text(qLines[i], marginLeft + qLabelWidth, y);
                y += lineHeight;
            }
            y += 1.5;

            // Options — try all 4 on ONE line; fall back to 2-per-row if too wide
            if (q.displayOptions && q.displayOptions.length > 0) {
                const opts = q.displayOptions;
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');

                // Build option strings
                const optStrings = opts.map(o => `${o.letter}) ${pdfSafe(o.text)}`);

                // Measure total width if all on one line (with spacing between)
                const optGap = 8; // mm gap between options
                let totalWidth = 0;
                optStrings.forEach((s, i) => {
                    totalWidth += doc.getTextWidth(s);
                    if (i < optStrings.length - 1) totalWidth += optGap;
                });

                if (totalWidth <= contentWidth) {
                    // All 4 options on ONE line
                    checkPage(lineHeight);
                    let xPos = marginLeft;
                    const colWidth = contentWidth / opts.length;
                    optStrings.forEach((s, i) => {
                        doc.text(s, marginLeft + i * colWidth, y);
                    });
                    y += lineHeight;
                } else {
                    // Fall back to 2 per row
                    const halfWidth = contentWidth / 2;
                    for (let i = 0; i < opts.length; i += 2) {
                        checkPage(lineHeight);
                        doc.text(optStrings[i], marginLeft, y);
                        if (i + 1 < opts.length) {
                            doc.text(optStrings[i + 1], marginLeft + halfWidth, y);
                        }
                        y += lineHeight;
                    }
                }
            }

            y += 3;
            globalQNum++;
        });
    });

    // Final separator
    checkPage(10);
    drawSeparator();

    doc.save(`${activePaperId}.pdf`);
}

// ========================================
// ANSWER KEY PDF GENERATOR
// ========================================

function downloadAnswerKeyPDF() {
    if (!activePaperId || !questionPapers[activePaperId]) {
        alert('No active paper selected.');
        return;
    }

    const paper = questionPapers[activePaperId];
    if (paper.questions.length === 0) {
        alert('The paper has no questions.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const lineHeight = 7;
    let y = 20;

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`Answer Key \u2013 ${activePaperId}`, pageWidth / 2, y, { align: 'center' });
    y += 12;

    const order = getConceptOrder(paper.school);
    const grouped = {};
    paper.questions.forEach(q => {
        if (!grouped[q.concept]) grouped[q.concept] = [];
        grouped[q.concept].push(q);
    });

    let globalQNum = 1;
    const allConcepts = [...order];
    Object.keys(grouped).forEach(c => {
        if (!allConcepts.includes(c)) allConcepts.push(c);
    });

    allConcepts.forEach(conceptKey => {
        const qs = grouped[conceptKey];
        if (!qs || qs.length === 0) return;

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(conceptDisplayTitles[conceptKey] || conceptKey, 20, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        qs.forEach(q => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(`Q${globalQNum}. ${q.correctLetter}`, 25, y);
            y += lineHeight;
            globalQNum++;
        });
        y += 4;
    });

    doc.save(`${activePaperId} - Answer Key.pdf`);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Populate School dropdown from RuleEngine
    const schoolSelect = document.getElementById('school');
    RuleEngine.listSchools().forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = RuleEngine.schoolLabels[key] || key;
        schoolSelect.appendChild(option);
    });

    // Populate Papers-tab School dropdown
    const paperSchoolSelect = document.getElementById('paperSchool');
    if (paperSchoolSelect) {
        RuleEngine.listSchools().forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = RuleEngine.schoolLabels[key] || key;
            paperSchoolSelect.appendChild(option);
        });
    }

    // Cascade: school → concept → difficulty
    updateConceptDropdown();

    console.log('Question Generator Ready — powered by Rule Engine');
});
