// ============================================================================
// RULE: Simple Interest — Find Principal (Medium 1)
// ============================================================================
//
// "An amount becomes ₹A in T years at R% per year.
//  What was the original principal?"
//
// Mathematical basis:
//   A = P + (P * R * T) / 100
//   A = P * (1 + R*T/100)
//   P = A / (1 + R*T/100) = (A * 100) / (100 + R*T)
//
// We generate P, R, T → compute A, then the question asks to find P from A, R, T.
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    medium: {
        principal: { min: 1000, max: 8000 },
        rate:      { min: 5,    max: 15 },
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
            R = randomInt(cfg.rate.min, cfg.rate.max);
            T = randomInt(cfg.time.min, cfg.time.max);
            P = randomInt(cfg.principal.min, cfg.principal.max);
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
            amount: Math.floor(A),
            rate: R,
            time: T
        },
        answer: P
    };
}

function validate(questionData, answer) {
    const { amount, rate, time } = questionData;
    if (!amount || !rate || !time) return false;

    // A = P + (P * R * T) / 100 → P = (A * 100) / (100 + R * T)
    const denominator = 100 + rate * time;
    const expected = (amount * 100) / denominator;
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
    const { amount, rate, time } = questionData;
    return `An amount becomes ₹${amount} in ${time} years at ${rate}% per year simple interest.\nWhat was the original principal amount?`;
}

module.exports = {
    id:                   'si_find_principal',
    name:                 'Simple Interest — Find Principal',
    description:          'Given final amount, rate, and time, find the original principal. (Medium 1)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'simple interest',
    tags:                 ["interest","principal","reverse"],
    gradeLevel:           '7-9',
    answerType:           'numeric'
};
