// ============================================================================
// RULE: Percentage — Marks Percentage (SOB/SOF)
// ============================================================================
//
// "In a test, Aman got M marks out of T. What is his percentage?"
//
// Mathematical basis:
//   answer = (M * 100) / T   (must be integer, no trailing zeros)
//
// ============================================================================

const { randomInt, hasTrailingZeros, randomIntNoTrailing } = require('../utils');

const difficultyConfig = {
    medium: {
        totalMarks:   { min: 25, max: 100 },
        marksObtained: { min: 10, max: 95 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.medium;

    let T, M;

    if (params && params.totalMarks != null && params.marksObtained != null) {
        T = params.totalMarks;
        M = params.marksObtained;
    } else {
        let found = false;
        for (let i = 0; i < 200; i++) {
            T = randomIntNoTrailing(cfg.totalMarks.min, cfg.totalMarks.max);
            M = randomInt(10, T - 5);
            const pct = (M * 100) / T;
            if (pct === Math.floor(pct) && !hasTrailingZeros(Math.floor(pct))) {
                found = true;
                break;
            }
        }
        if (!found) throw new Error('Could not find valid params within 200 attempts');
    }

    if (!Number.isInteger(T) || T <= 0) throw new Error('totalMarks must be a positive integer');
    if (!Number.isInteger(M) || M <= 0 || M >= T) throw new Error('marksObtained must be between 1 and totalMarks-1');

    const percent = (M * 100) / T;
    if (percent !== Math.floor(percent)) throw new Error('Percentage is not a whole number for these params');

    return {
        questionData: {
            totalMarks: T,
            marksObtained: M
        },
        answer: Math.floor(percent)
    };
}

function validate(questionData, answer) {
    const { totalMarks, marksObtained } = questionData;
    if (!totalMarks || !Number.isInteger(totalMarks) || totalMarks <= 0) return false;
    if (!marksObtained || !Number.isInteger(marksObtained) || marksObtained <= 0) return false;

    const expected = (marksObtained * 100) / totalMarks;
    if (expected !== Math.floor(expected)) return false;

    return answer === Math.floor(expected);
}

function generateForDifficulty(difficultyKey) {
    const cfg = difficultyConfig[difficultyKey];
    if (!cfg) {
        throw new Error(`Unknown difficulty: "${difficultyKey}". Valid: ${Object.keys(difficultyConfig).join(', ')}`);
    }
    return generate();
}

function formatQuestion(questionData) {
    const { totalMarks, marksObtained } = questionData;
    const names = ['Aman', 'Priya', 'Rohan', 'Sita', 'Kavya', 'Arjun', 'Meera', 'Vikram'];
    const subjects = ['a test', 'an exam', 'a quiz', 'a maths test', 'a science exam', 'a class test'];
    const name = names[marksObtained % names.length];
    const subject = subjects[totalMarks % subjects.length];
    const pronoun = (name === 'Priya' || name === 'Sita' || name === 'Kavya' || name === 'Meera') ? 'her' : 'his';
    return `In ${subject}, ${name} got ${marksObtained} marks out of ${totalMarks}.\nWhat is ${pronoun} percentage?`;
}

module.exports = {
    id:                   'pct_marks_percentage',
    name:                 'Percentage — Marks Percentage',
    description:          'Given marks obtained out of total marks, find the percentage scored. (SOB/SOF medium2)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'percentages',
    tags:                 ["percentage","marks","exam"],
    gradeLevel:           '6-8',
    answerType:           'numeric'
};
