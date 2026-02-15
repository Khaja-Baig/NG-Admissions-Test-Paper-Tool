// ============================================================================
// RULE: Percentage — After Addition (SOP/BCA)
// ============================================================================
//
// "Bought X flowers, Y are roses. Bought Z more roses.
//  What is the percentage of roses now?"
//
// Mathematical basis:
//   finalRoses = Y + Z
//   finalTotal = X + Z
//   answer     = (finalRoses * 100) / finalTotal   (must be integer)
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    medium: {
        total:   { min: 30, max: 100 },
        subset:  { min: 5,  max: 90 },
        added:   { min: 5,  max: 30 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.medium;

    let X, Y, Z;

    if (params && params.total != null && params.subset != null && params.added != null) {
        X = params.total;
        Y = params.subset;
        Z = params.added;
    } else {
        for (let i = 0; i < 1000; i++) {
            X = randomInt(cfg.total.min, cfg.total.max);
            Y = randomInt(5, X - 10);
            Z = randomInt(cfg.added.min, cfg.added.max);
            const finalRoses = Y + Z;
            const finalTotal = X + Z;
            const pct = (finalRoses * 100) / finalTotal;
            if (pct === Math.floor(pct)) break;
            if (i === 999) throw new Error('Could not find valid params within 1000 attempts');
        }
    }

    if (!Number.isInteger(X) || X <= 0) throw new Error('total must be a positive integer');
    if (!Number.isInteger(Y) || Y < 0 || Y >= X) throw new Error('subset must be a non-negative integer less than total');
    if (!Number.isInteger(Z) || Z <= 0) throw new Error('added must be a positive integer');

    const finalRoses = Y + Z;
    const finalTotal = X + Z;
    const percent = (finalRoses * 100) / finalTotal;
    if (percent !== Math.floor(percent)) throw new Error('Percentage is not a whole number for these params');

    return {
        questionData: {
            total: X,
            subset: Y,
            added: Z,
            finalSubset: finalRoses,
            finalTotal: finalTotal
        },
        answer: Math.floor(percent)
    };
}

function validate(questionData, answer) {
    const { total, subset, added } = questionData;
    if (!total || !Number.isInteger(total) || total <= 0) return false;
    if (subset == null || !Number.isInteger(subset)) return false;
    if (!added || !Number.isInteger(added) || added <= 0) return false;

    const finalRoses = subset + added;
    const finalTotal = total + added;
    const expected = (finalRoses * 100) / finalTotal;
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
    const { total, subset, added } = questionData;
    const names = ['Rahul', 'Priya', 'Arman', 'Sita', 'Rohan'];
    const name = names[total % names.length];
    const pronoun = (name === 'Priya' || name === 'Sita') ? 'she' : 'he';
    return `${name} bought ${total} flowers, out of which ${subset} are roses.\nIf ${pronoun} bought ${added} more roses, then what is the percentage of roses?`;
}

module.exports = {
    id:                   'pct_after_addition',
    name:                 'Percentage — After Addition',
    description:          'Given total items, a subset count, and items added to the subset, find the new percentage of the subset.',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'percentages',
    tags:                 ["percentage","addition","flowers"],
    gradeLevel:           '6-8',
    answerType:           'numeric'
};
