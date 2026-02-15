// ============================================================================
// RULE: Alternating Multiplier Pattern
// ============================================================================
//
// Generates a pattern with two interleaved sub-sequences where each
// sub-sequence multiplies by an increasing factor.
//
// Mathematical basis:
//   Given: x1, x2 (two seeds, each 1–5)
//   x3 = x1 * 2
//   x4 = x2 * 3
//   x5 = x3 * 2  (= x1 * 4)
//   x6 = x4 * 3  (= x2 * 9)  ← answer
//
//   Odd positions:  x1, x1*2, x1*4   (multiply by 2 each step)
//   Even positions: x2, x2*3, x2*9   (multiply by 3 each step)
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    hard: {
        x1: { min: 1, max: 5 },
        x2: { min: 1, max: 5 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.hard;
    const x1 = (params && params.x1 != null) ? params.x1 : randomInt(cfg.x1.min, cfg.x1.max);
    const x2 = (params && params.x2 != null) ? params.x2 : randomInt(cfg.x2.min, cfg.x2.max);

    if (!Number.isInteger(x1)) throw new Error('x1 must be an integer');
    if (!Number.isInteger(x2)) throw new Error('x2 must be an integer');
    if (x1 < 1 || x1 > 10) throw new Error('x1 must be between 1 and 10');
    if (x2 < 1 || x2 > 10) throw new Error('x2 must be between 1 and 10');

    const x3 = x1 * 2;
    const x4 = x2 * 3;
    const x5 = x3 * 2;
    const answer = x4 * 3;

    return {
        questionData: {
            sequence: [x1, x2, x3, x4, x5],
            seeds: { x1, x2 }
        },
        answer: answer
    };
}

function validate(questionData, answer) {
    const seq = questionData.sequence;
    if (!Array.isArray(seq) || seq.length < 5) return false;

    // Odd-indexed positions (0,2,4): each is 2× the previous odd-position
    // Even-indexed positions (1,3): each is 3× the previous even-position
    const x1 = seq[0];
    const x2 = seq[1];

    // Verify pattern
    if (seq[2] !== x1 * 2) return false;
    if (seq[3] !== x2 * 3) return false;
    if (seq[4] !== x1 * 4) return false;

    const expected = x2 * 9;
    return answer === expected;
}

function generateForDifficulty(difficultyKey) {
    const cfg = difficultyConfig[difficultyKey];
    if (!cfg) {
        throw new Error(`Unknown difficulty: "${difficultyKey}". Valid: ${Object.keys(difficultyConfig).join(', ')}`);
    }
    return generate({
        x1: randomInt(cfg.x1.min, cfg.x1.max),
        x2: randomInt(cfg.x2.min, cfg.x2.max)
    });
}

function formatQuestion(questionData) {
    const sequence = questionData.sequence.join(', ') + ', ___';
    return `What will be the next term in the pattern?\n${sequence}`;
}

module.exports = {
    id:                   'alternating_multiplier',
    name:                 'Alternating Multiplier Pattern',
    description:          'Generates a pattern with two interleaved sub-sequences: odd positions multiply by 2, even positions multiply by 3. The student must find the 6th term.',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'number patterns',
    tags:                 ["alternating","multiply","pattern"],
    gradeLevel:           '6-8',
    answerType:           'numeric'
};
