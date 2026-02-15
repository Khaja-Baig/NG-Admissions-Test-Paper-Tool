// ============================================================================
// RULE: Simple Interest — Find Total Amount (Medium 2)
// ============================================================================
//
// "Deposits ₹P at R% per year. Total amount after T years?"
//
// Mathematical basis:
//   SI = (P * R * T) / 100
//   A  = P + SI       (must be integer)
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    medium: {
        principal: { min: 500,  max: 5000 },
        rate:      { min: 10,   max: 30 },
        time:      { min: 2,    max: 4 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.medium;

    let P, R, T;

    if (params && params.principal != null && params.rate != null && params.time != null) {
        P = params.principal;
        R = params.rate;
        T = params.time;
    } else {
        let found = false;
        for (let i = 0; i < 1000; i++) {
            P = randomInt(cfg.principal.min, cfg.principal.max);
            R = randomInt(cfg.rate.min, cfg.rate.max);
            T = randomInt(cfg.time.min, cfg.time.max);
            const A = P + (P * R * T) / 100;
            if (A === Math.floor(A)) { found = true; break; }
        }
        if (!found) throw new Error('Could not find valid params within 1000 attempts');
    }

    if (!Number.isInteger(P) || P <= 0) throw new Error('principal must be a positive integer');
    if (!Number.isInteger(R) || R <= 0) throw new Error('rate must be a positive integer');
    if (!Number.isInteger(T) || T <= 0) throw new Error('time must be a positive integer');

    const A = P + (P * R * T) / 100;
    if (A !== Math.floor(A)) throw new Error('Amount is not a whole number for these params');

    return {
        questionData: {
            principal: P,
            rate: R,
            time: T
        },
        answer: Math.floor(A)
    };
}

function validate(questionData, answer) {
    const { principal, rate, time } = questionData;
    if (!principal || !rate || !time) return false;

    const expected = principal + (principal * rate * time) / 100;
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
    const { principal, rate, time } = questionData;
    const names = ['Rahul', 'Priya', 'Arman'];
    const name = names[principal % names.length];
    const pronoun = name === 'Priya' ? 'she' : 'he';
    return `${name} deposits ₹${principal} in a bank\nwhere ${pronoun} gets ${rate}% simple interest per year.\nHow much total amount will ${pronoun} have after ${time} years?`;
}

module.exports = {
    id:                   'si_find_amount',
    name:                 'Simple Interest — Find Total Amount',
    description:          'Given principal, rate, and time, find the total amount after T years. (Medium 2)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'simple interest',
    tags:                 ["interest","amount","total"],
    gradeLevel:           '6-8',
    answerType:           'numeric'
};
