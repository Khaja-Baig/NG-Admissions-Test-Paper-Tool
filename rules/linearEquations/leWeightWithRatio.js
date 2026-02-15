// ============================================================================
// RULE: Linear Equation — Weight with Sack Ratio (Hard 2)
// ============================================================================
//
// "Sack of item1 weighs w1 kg, sack of item2 weighs w2 kg.
//  For every r1 item1 sacks there are r2 item2 sacks.
//  Total weight is W kg. How many item1 sacks?"
//
// Mathematical basis:
//   Let n = a multiplier.
//   item1Sacks = r1 * n
//   item2Sacks = r2 * n
//   totalWeight = w1 * r1 * n + w2 * r2 * n = n * (w1*r1 + w2*r2)
//   n = totalWeight / (w1*r1 + w2*r2)
//   answer = r1 * n
//
// ============================================================================

const { randomInt } = require('../utils');

const SACK_PAIRS = [
    { item1: 'rice',    w1: 25, item2: 'sugar',   w2: 50 },
    { item1: 'rice',    w1: 50, item2: 'sugar',   w2: 25 },
    { item1: 'rice',    w1: 25, item2: 'wheat',   w2: 50 },
    { item1: 'wheat',   w1: 50, item2: 'sugar',   w2: 25 },
    { item1: 'rice',    w1: 10, item2: 'sugar',   w2: 5 },
    { item1: 'wheat',   w1: 10, item2: 'rice',    w2: 25 },
    { item1: 'cement',  w1: 50, item2: 'sand',    w2: 25 },
    { item1: 'rice',    w1: 5,  item2: 'flour',   w2: 10 },
    { item1: 'flour',   w1: 5,  item2: 'sugar',   w2: 25 },
    { item1: 'cement',  w1: 50, item2: 'gravel',  w2: 40 },
    { item1: 'wheat',   w1: 25, item2: 'flour',   w2: 10 },
    { item1: 'rice',    w1: 10, item2: 'lentils', w2: 5 }
];

const difficultyConfig = {
    hard: {
        ratio1:     { min: 2, max: 4 },
        ratio2:     { min: 2, max: 5 },
        multiplier: { min: 50, max: 200 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.hard;

    let w1, w2, item1, item2, r1, r2, n;

    if (params && params.w1 != null && params.w2 != null &&
        params.r1 != null && params.r2 != null && params.multiplier != null) {
        w1 = params.w1;
        w2 = params.w2;
        item1 = params.item1 || 'item1';
        item2 = params.item2 || 'item2';
        r1 = params.r1;
        r2 = params.r2;
        n = params.multiplier;
    } else {
        const pair = SACK_PAIRS[randomInt(0, SACK_PAIRS.length - 1)];
        w1 = pair.w1;
        w2 = pair.w2;
        item1 = pair.item1;
        item2 = pair.item2;
        r1 = randomInt(cfg.ratio1.min, cfg.ratio1.max);
        r2 = randomInt(cfg.ratio2.min, cfg.ratio2.max);
        n = randomInt(cfg.multiplier.min, cfg.multiplier.max);
    }

    if (!Number.isInteger(w1) || w1 <= 0) throw new Error('w1 must be a positive integer');
    if (!Number.isInteger(w2) || w2 <= 0) throw new Error('w2 must be a positive integer');
    if (!Number.isInteger(r1) || r1 <= 0) throw new Error('r1 must be a positive integer');
    if (!Number.isInteger(r2) || r2 <= 0) throw new Error('r2 must be a positive integer');
    if (!Number.isInteger(n) || n <= 0) throw new Error('multiplier must be a positive integer');

    const totalWeight = (w1 * r1 * n) + (w2 * r2 * n);
    const item1Sacks = r1 * n;

    return {
        questionData: {
            item1: item1,
            item2: item2,
            w1: w1,
            w2: w2,
            r1: r1,
            r2: r2,
            totalWeight: totalWeight
        },
        answer: item1Sacks
    };
}

function validate(questionData, answer) {
    const { w1, w2, r1, r2, totalWeight } = questionData;
    if (!w1 || !w2 || !r1 || !r2 || !totalWeight) return false;

    // n = totalWeight / (w1*r1 + w2*r2)
    const denominator = w1 * r1 + w2 * r2;
    if (denominator === 0) return false;
    const n = totalWeight / denominator;
    if (n !== Math.floor(n)) return false;

    const expected = r1 * n;
    return answer === expected;
}

function generateForDifficulty(difficultyKey) {
    const cfg = difficultyConfig[difficultyKey];
    if (!cfg) {
        throw new Error(`Unknown difficulty: "${difficultyKey}". Valid: ${Object.keys(difficultyConfig).join(', ')}`);
    }
    return generate();
}

function formatQuestion(questionData) {
    const { item1, item2, w1, w2, r1, r2, totalWeight } = questionData;
    return `The weight of one ${item1} sack is ${w1}kg, and the weight of one ${item2} sack is ${w2}kg. For every ${r1} ${item1} sacks, you have ${r2} ${item2} sacks.\n\n(Example: If there are ${r2} ${item2} sacks, then there are ${r1} ${item1} sacks. If there are ${r2 * 2} ${item2} sacks, then there are ${r1 * 2} ${item1} sacks, and so on.)\n\nThe total weight of all the sacks is ${totalWeight} kg. How many ${item1} sacks are there?`;
}

module.exports = {
    id:                   'le_weight_with_ratio',
    name:                 'Linear Equation — Weight with Sack Ratio',
    description:          'Given sack weights, a ratio between sack counts, and total weight, find how many sacks of one type. (Hard 2)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'linear equations',
    tags:                 ["equation","weight","sack","ratio"],
    gradeLevel:           '7-9',
    answerType:           'numeric'
};
