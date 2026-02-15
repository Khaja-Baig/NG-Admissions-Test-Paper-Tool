// ============================================================================
// RULE: Increasing Difference Pattern
// ============================================================================
//
// Generates a number pattern where the difference between consecutive terms
// increases by a constant amount: +5, +7, +9, +11
//
// Mathematical basis:
//   Given: start (a)
//   Sequence: a, a+5, a+12, a+21, a+32
//   Differences: 5, 7, 9, 11 (each diff increases by 2)
//   Answer: a + 32
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    medium: {
        start: { min: 1, max: 50 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.medium;
    const a = (params && params.start != null) ? params.start : randomInt(cfg.start.min, cfg.start.max);

    if (!Number.isInteger(a)) throw new Error('start must be an integer');
    if (a < 0) throw new Error('start must be non-negative');

    // Differences: +5, +7, +9, +11
    const seq = [a, a + 5, a + 12, a + 21];
    const answer = a + 32;

    return {
        questionData: {
            sequence: seq,
            differences: [5, 7, 9, 11],
            diffStep: 2
        },
        answer: answer
    };
}

function validate(questionData, answer) {
    const seq = questionData.sequence;
    if (!Array.isArray(seq) || seq.length < 3) return false;

    // Verify increasing differences with constant step
    const diffs = [];
    for (let i = 1; i < seq.length; i++) {
        diffs.push(seq[i] - seq[i - 1]);
    }

    // Check that difference-of-differences is constant
    const step = diffs[1] - diffs[0];
    for (let i = 2; i < diffs.length; i++) {
        if (diffs[i] - diffs[i - 1] !== step) return false;
    }

    // Next difference
    const nextDiff = diffs[diffs.length - 1] + step;
    const expected = seq[seq.length - 1] + nextDiff;

    return answer === expected;
}

function generateForDifficulty(difficultyKey) {
    const cfg = difficultyConfig[difficultyKey];
    if (!cfg) {
        throw new Error(`Unknown difficulty: "${difficultyKey}". Valid: ${Object.keys(difficultyConfig).join(', ')}`);
    }
    return generate({
        start: randomInt(cfg.start.min, cfg.start.max)
    });
}

function formatQuestion(questionData) {
    const sequence = questionData.sequence.join(', ') + ', ___';
    return `What will be the next term in the pattern?\n${sequence}`;
}

module.exports = {
    id:                   'increasing_difference',
    name:                 'Increasing Difference Pattern',
    description:          'Generates a pattern where differences between terms increase by a constant step (+5, +7, +9, +11). The student must find the next term.',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'number patterns',
    tags:                 ["increasing","sequence","pattern"],
    gradeLevel:           '5-7',
    answerType:           'numeric'
};
