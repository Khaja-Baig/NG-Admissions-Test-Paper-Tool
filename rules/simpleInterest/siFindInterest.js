// ============================================================================
// RULE: Simple Interest — Find Interest (Easy)
// ============================================================================
//
// "Rahul deposits ₹P at R% per year. Find interest in 1 year."
//
// Mathematical basis:
//   SI = (P * R) / 100    (for T = 1 year; must be integer)
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    easy: {
        principal: { min: 1000, max: 10000 },
        rate:      { min: 5,    max: 15 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.easy;

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
            rate: R,
            time: 1
        },
        answer: Math.floor(SI)
    };
}

function validate(questionData, answer) {
    const { principal, rate, time } = questionData;
    if (!principal || !rate) return false;

    const t = time || 1;
    const expected = (principal * rate * t) / 100;
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
    const { principal, rate } = questionData;
    const names = ['Rahul', 'Priya', 'Arman', 'Sita'];
    const name = names[principal % names.length];
    return `${name} deposits ₹${principal} in a bank.\nThe bank gives ${rate}% interest per year.\nHow much interest will ${name} get in 1 year?`;
}

module.exports = {
    id:                   'si_find_interest',
    name:                 'Simple Interest — Find Interest',
    description:          'Given principal and rate, find the simple interest for 1 year. (Easy)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty
};
