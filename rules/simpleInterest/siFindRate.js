// ============================================================================
// RULE: Simple Interest — Find Rate (Hard)
// ============================================================================
//
// "The interest on ₹P for 1 year is ₹SI. What is the annual rate?"
//
// Mathematical basis:
//   SI = (P * R * 1) / 100
//   R  = (SI * 100) / P    (must be integer)
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    hard: {
        principal: { min: 200,  max: 1000 },
        rate:      { min: 10,   max: 30 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.hard;

    let P, R;

    if (params && params.principal != null && params.rate != null) {
        P = params.principal;
        R = params.rate;
    } else {
        let found = false;
        for (let i = 0; i < 200; i++) {
            P = randomInt(cfg.principal.min, cfg.principal.max);
            R = randomInt(cfg.rate.min, cfg.rate.max);
            const SI = (P * R) / 100;
            if (SI === Math.floor(SI)) { found = true; break; }
        }
        if (!found) throw new Error('Could not find valid params within 200 attempts');
    }

    if (!Number.isInteger(P) || P <= 0) throw new Error('principal must be a positive integer');
    if (!Number.isInteger(R) || R <= 0) throw new Error('rate must be a positive integer');

    const SI = (P * R) / 100;
    if (SI !== Math.floor(SI)) throw new Error('Interest is not a whole number for these params');

    return {
        questionData: {
            principal: P,
            interest: Math.floor(SI),
            time: 1
        },
        answer: R
    };
}

function validate(questionData, answer) {
    const { principal, interest } = questionData;
    if (!principal || !interest) return false;

    // R = (SI * 100) / P
    const expected = (interest * 100) / principal;
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
    const { principal, interest } = questionData;
    return `The interest on ₹${principal} for 1 year is ₹${interest}.\nWhat is the annual rate of interest?`;
}

module.exports = {
    id:                   'si_find_rate',
    name:                 'Simple Interest — Find Rate',
    description:          'Given principal and interest for 1 year, find the annual rate of interest. (Hard)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty
};
