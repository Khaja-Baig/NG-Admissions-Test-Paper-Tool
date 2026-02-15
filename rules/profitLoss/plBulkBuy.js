// ============================================================================
// RULE: Profit & Loss — Bulk Buy (Medium 2)
// ============================================================================
//
// "A trader buys N kg at ₹CP_per per kg and sells all for ₹SP_total.
//  Find the profit or loss."
//
// Mathematical basis:
//   totalCP = N * CP_per
//   diff    = SP_total - totalCP
//   answer  = |diff|
//   type    = diff > 0 ? 'profit' : 'loss'
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    medium: {
        quantity:     { min: 3,   max: 8 },
        costPerUnit:  { min: 20,  max: 60 },
        totalSelling: { min: 100, max: 400 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.medium;

    let N, CP_per, SP_total;

    if (params && params.quantity != null && params.costPerUnit != null && params.totalSelling != null) {
        N = params.quantity;
        CP_per = params.costPerUnit;
        SP_total = params.totalSelling;
    } else {
        let found = false;
        for (let i = 0; i < 100; i++) {
            N = randomInt(cfg.quantity.min, cfg.quantity.max);
            CP_per = randomInt(cfg.costPerUnit.min, cfg.costPerUnit.max);
            SP_total = randomInt(cfg.totalSelling.min, cfg.totalSelling.max);
            if (SP_total !== N * CP_per) { found = true; break; }
        }
        if (!found) throw new Error('Could not find valid params');
    }

    if (!Number.isInteger(N) || N <= 0) throw new Error('quantity must be a positive integer');
    if (!Number.isInteger(CP_per) || CP_per <= 0) throw new Error('costPerUnit must be a positive integer');
    if (!Number.isInteger(SP_total) || SP_total <= 0) throw new Error('totalSelling must be a positive integer');

    const totalCP = N * CP_per;
    const diff = SP_total - totalCP;
    if (diff === 0) throw new Error('Profit/Loss must not be zero');

    const type = diff > 0 ? 'profit' : 'loss';

    return {
        questionData: {
            quantity: N,
            costPerUnit: CP_per,
            totalSelling: SP_total,
            totalCost: totalCP,
            type: type
        },
        answer: Math.abs(diff)
    };
}

function validate(questionData, answer) {
    const { quantity, costPerUnit, totalSelling } = questionData;
    if (!quantity || !costPerUnit || !totalSelling) return false;

    const totalCP = quantity * costPerUnit;
    const expected = Math.abs(totalSelling - totalCP);
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
    const { quantity, costPerUnit, totalSelling } = questionData;
    return `A trader buys ${quantity} kg of oranges at ₹${costPerUnit} per kg\nand sells all the oranges for ₹${totalSelling}.\nFind the profit or loss.`;
}

module.exports = {
    id:                   'pl_bulk_buy',
    name:                 'Profit & Loss — Bulk Buy',
    description:          'Given bulk purchase at per-unit cost and total selling price, find the profit or loss. (Medium 2)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'profit and loss',
    tags:                 ["profit","bulk","wholesale","retail"],
    gradeLevel:           '6-8',
    answerType:           'numeric'
};
