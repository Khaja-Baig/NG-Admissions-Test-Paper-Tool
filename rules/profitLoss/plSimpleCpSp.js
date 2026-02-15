// ============================================================================
// RULE: Profit & Loss — Simple CP vs SP (Easy)
// ============================================================================
//
// "Anwar buys a notebook for ₹CP and sells it for ₹SP.
//  Did he make a profit or loss? How much?"
//
// Mathematical basis:
//   answer = |SP - CP|
//   type   = SP > CP ? 'profit' : 'loss'
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    easy: {
        costPrice:    { min: 50,  max: 200 },
        sellingPrice: { min: 30,  max: 250 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.easy;

    let CP, SP;

    if (params && params.costPrice != null && params.sellingPrice != null) {
        CP = params.costPrice;
        SP = params.sellingPrice;
    } else {
        let found = false;
        for (let i = 0; i < 100; i++) {
            CP = randomInt(cfg.costPrice.min, cfg.costPrice.max);
            SP = randomInt(cfg.sellingPrice.min, cfg.sellingPrice.max);
            if (CP !== SP) { found = true; break; }
        }
        if (!found) throw new Error('Could not find valid params within 100 attempts');
    }

    if (!Number.isInteger(CP) || CP <= 0) throw new Error('costPrice must be a positive integer');
    if (!Number.isInteger(SP) || SP <= 0) throw new Error('sellingPrice must be a positive integer');
    if (CP === SP) throw new Error('costPrice and sellingPrice must differ');

    const diff = Math.abs(SP - CP);
    const type = SP > CP ? 'profit' : 'loss';

    return {
        questionData: {
            costPrice: CP,
            sellingPrice: SP,
            type: type
        },
        answer: diff
    };
}

function validate(questionData, answer) {
    const { costPrice, sellingPrice } = questionData;
    if (!costPrice || !sellingPrice) return false;

    const expected = Math.abs(sellingPrice - costPrice);
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
    const { costPrice, sellingPrice } = questionData;
    return `Anwar buys a notebook for ₹${costPrice} and sells it for ₹${sellingPrice}.\nDid he make a profit or a loss? How much?`;
}

module.exports = {
    id:                   'pl_simple_cp_sp',
    name:                 'Profit & Loss — Simple CP vs SP',
    description:          'Given cost price and selling price, find the profit or loss amount. (Easy)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty
};
