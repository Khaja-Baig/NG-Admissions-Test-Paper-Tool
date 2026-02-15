// ============================================================================
// RULE: Profit & Loss — Split Selling (Hard)
// ============================================================================
//
// "A shopkeeper buys N pens at ₹CP1 per pen.
//  Sells N2 pens at ₹SP1 per pen and remaining at ₹SP2 per pen.
//  What is the total profit or loss?"
//
// Mathematical basis:
//   totalCP = N * CP1
//   totalSP = (N2 * SP1) + ((N - N2) * SP2)
//   diff    = totalSP - totalCP
//   answer  = |diff|
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    hard: {
        totalItems:    { min: 10, max: 20 },
        costPerUnit:   { min: 15, max: 30 },
        soldCount:     { min: 5,  max: 18 },
        sellingPrice1: { min: 12, max: 35 },
        sellingPrice2: { min: 12, max: 35 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.hard;

    let N, CP1, N2, SP1, SP2;

    if (params && params.totalItems != null && params.costPerUnit != null &&
        params.soldCount != null && params.sellingPrice1 != null && params.sellingPrice2 != null) {
        N = params.totalItems;
        CP1 = params.costPerUnit;
        N2 = params.soldCount;
        SP1 = params.sellingPrice1;
        SP2 = params.sellingPrice2;
    } else {
        let found = false;
        for (let i = 0; i < 100; i++) {
            N = randomInt(cfg.totalItems.min, cfg.totalItems.max);
            CP1 = randomInt(cfg.costPerUnit.min, cfg.costPerUnit.max);
            N2 = randomInt(Math.floor(N / 2), N - 2);
            SP1 = randomInt(cfg.sellingPrice1.min, cfg.sellingPrice1.max);
            SP2 = randomInt(cfg.sellingPrice2.min, cfg.sellingPrice2.max);

            const totalCP = N * CP1;
            const totalSP = (N2 * SP1) + ((N - N2) * SP2);
            if (totalSP !== totalCP) { found = true; break; }
        }
        if (!found) throw new Error('Could not find valid params');
    }

    if (!Number.isInteger(N) || N <= 0) throw new Error('totalItems must be a positive integer');
    if (!Number.isInteger(CP1) || CP1 <= 0) throw new Error('costPerUnit must be a positive integer');
    if (!Number.isInteger(N2) || N2 <= 0 || N2 >= N) throw new Error('soldCount must be between 1 and totalItems-1');
    if (!Number.isInteger(SP1) || SP1 <= 0) throw new Error('sellingPrice1 must be a positive integer');
    if (!Number.isInteger(SP2) || SP2 <= 0) throw new Error('sellingPrice2 must be a positive integer');

    const totalCP = N * CP1;
    const totalSP = (N2 * SP1) + ((N - N2) * SP2);
    const diff = totalSP - totalCP;
    if (diff === 0) throw new Error('Profit/Loss must not be zero');

    const type = diff > 0 ? 'profit' : 'loss';

    return {
        questionData: {
            totalItems: N,
            costPerUnit: CP1,
            soldCount: N2,
            remainingCount: N - N2,
            sellingPrice1: SP1,
            sellingPrice2: SP2,
            type: type
        },
        answer: Math.abs(diff)
    };
}

function validate(questionData, answer) {
    const { totalItems, costPerUnit, soldCount, sellingPrice1, sellingPrice2 } = questionData;
    if (!totalItems || !costPerUnit || !soldCount || !sellingPrice1 || !sellingPrice2) return false;

    const totalCP = totalItems * costPerUnit;
    const remaining = totalItems - soldCount;
    const totalSP = (soldCount * sellingPrice1) + (remaining * sellingPrice2);
    const expected = Math.abs(totalSP - totalCP);

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
    const { totalItems, costPerUnit, soldCount, remainingCount, sellingPrice1, sellingPrice2 } = questionData;
    return `A shopkeeper buys ${totalItems} pens at ₹${costPerUnit} per pen.\nHe sells ${soldCount} pens at ₹${sellingPrice1} per pen and\nthe remaining ${remainingCount} pens at ₹${sellingPrice2} per pen.\nWhat is his total profit or loss?`;
}

module.exports = {
    id:                   'pl_split_selling',
    name:                 'Profit & Loss — Split Selling',
    description:          'Buy N items at one price, sell some at price1 and rest at price2, find total profit or loss. (Hard)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty
};
