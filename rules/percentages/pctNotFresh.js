// ============================================================================
// RULE: Percentage — Not Fresh (SOP/BCA)
// ============================================================================
//
// "I bought X apples, out of which Y were fresh.
//  What percentage of apples are not fresh?"
//
// Mathematical basis:
//   notFresh = X - Y
//   answer   = (notFresh * 100) / X     (must be integer)
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    easy: {
        total: { min: 20, max: 100 },
        fresh: { min: 5, max: 95 }     // will be clamped to < total - 5
    }
};

function generate(params) {
    const cfg = difficultyConfig.easy;

    let X, Y;

    if (params && params.total != null && params.fresh != null) {
        X = params.total;
        Y = params.fresh;
    } else {
        // Retry internally to guarantee integer percentage
        for (let i = 0; i < 200; i++) {
            X = randomInt(cfg.total.min, cfg.total.max);
            Y = randomInt(5, X - 5);
            const notFresh = X - Y;
            const pct = (notFresh * 100) / X;
            if (pct === Math.floor(pct)) break;
            if (i === 199) throw new Error('Could not find valid params within 200 attempts');
        }
    }

    if (!Number.isInteger(X) || X <= 0) throw new Error('total must be a positive integer');
    if (!Number.isInteger(Y) || Y < 0 || Y >= X) throw new Error('fresh must be a non-negative integer less than total');

    const notFresh = X - Y;
    const percent = (notFresh * 100) / X;
    if (percent !== Math.floor(percent)) throw new Error('Percentage is not a whole number for these params');

    return {
        questionData: {
            total: X,
            fresh: Y,
            notFresh: notFresh
        },
        answer: Math.floor(percent)
    };
}

function validate(questionData, answer) {
    const { total, fresh } = questionData;
    if (!total || !Number.isInteger(total) || total <= 0) return false;
    if (fresh == null || !Number.isInteger(fresh) || fresh < 0 || fresh >= total) return false;

    const notFresh = total - fresh;
    const expected = (notFresh * 100) / total;
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
    const { total, fresh } = questionData;
    return `I bought ${total} apples, out of which ${fresh} were fresh.\nWhat percentage of apples are not fresh?`;
}

module.exports = {
    id:                   'pct_not_fresh',
    name:                 'Percentage — Not Fresh Items',
    description:          'Given total items and fresh count, find the percentage that are not fresh. Answer must be a whole number.',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'percentages',
    tags:                 ["percentage","subtraction","not fresh"],
    gradeLevel:           '5-7',
    answerType:           'numeric'
};
