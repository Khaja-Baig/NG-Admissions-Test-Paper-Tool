// ============================================================================
// RULE: Profit & Loss — Target Profit, Find SP (Medium 1)
// ============================================================================
//
// "Riya buys a chair for ₹CP. She wants a profit of ₹P.
//  At what price should she sell?"
//
// Mathematical basis:
//   answer = CP + P
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    medium: {
        costPrice:    { min: 100, max: 800 },
        targetProfit: { min: 50,  max: 300 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.medium;

    const CP = (params && params.costPrice != null)    ? params.costPrice    : randomInt(cfg.costPrice.min, cfg.costPrice.max);
    const P  = (params && params.targetProfit != null)  ? params.targetProfit : randomInt(cfg.targetProfit.min, cfg.targetProfit.max);

    if (!Number.isInteger(CP) || CP <= 0) throw new Error('costPrice must be a positive integer');
    if (!Number.isInteger(P) || P <= 0) throw new Error('targetProfit must be a positive integer');

    const SP = CP + P;

    return {
        questionData: {
            costPrice: CP,
            targetProfit: P
        },
        answer: SP
    };
}

function validate(questionData, answer) {
    const { costPrice, targetProfit } = questionData;
    if (!costPrice || !targetProfit) return false;

    return answer === costPrice + targetProfit;
}

function generateForDifficulty(difficultyKey) {
    const cfg = difficultyConfig[difficultyKey];
    if (!cfg) {
        throw new Error(`Unknown difficulty: "${difficultyKey}". Valid: ${Object.keys(difficultyConfig).join(', ')}`);
    }
    return generate({
        costPrice:    randomInt(cfg.costPrice.min, cfg.costPrice.max),
        targetProfit: randomInt(cfg.targetProfit.min, cfg.targetProfit.max)
    });
}

function formatQuestion(questionData) {
    const { costPrice, targetProfit } = questionData;
    return `Riya buys a chair for ₹${costPrice}.\nShe wants to make an exact profit of ₹${targetProfit}.\nAt what price should she sell the chair?`;
}

module.exports = {
    id:                   'pl_target_profit_sp',
    name:                 'Profit & Loss — Target Profit, Find SP',
    description:          'Given cost price and desired profit, find the selling price. (Medium 1)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty
};
