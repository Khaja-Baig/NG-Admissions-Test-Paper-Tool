// ============================================================================
// RULE: Percentage — Discount / Tax Amount (SOB/SOF)
// ============================================================================
//
// "The price of a jacket is ₹P. The shopkeeper gives a discount of D%.
//  What is the amount of the discount?"
//
// Mathematical basis:
//   answer = (P * D) / 100    (must be integer, no trailing zeros)
//
// ============================================================================

const { randomInt, hasTrailingZeros, randomIntNoTrailing } = require('../utils');

const difficultyConfig = {
    medium: {
        price:    { min: 200, max: 2000 },
        percent:  { min: 5,   max: 30 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.medium;

    let P, D;

    if (params && params.price != null && params.percent != null) {
        P = params.price;
        D = params.percent;
    } else {
        let found = false;
        for (let i = 0; i < 200; i++) {
            P = randomIntNoTrailing(cfg.price.min, cfg.price.max);
            D = randomInt(cfg.percent.min, cfg.percent.max);
            const amount = (P * D) / 100;
            if (amount === Math.floor(amount) && !hasTrailingZeros(Math.floor(amount))) {
                found = true;
                break;
            }
        }
        if (!found) throw new Error('Could not find valid params within 200 attempts');
    }

    if (!Number.isInteger(P) || P <= 0) throw new Error('price must be a positive integer');
    if (!Number.isInteger(D) || D <= 0 || D > 100) throw new Error('percent must be between 1 and 100');

    const amount = (P * D) / 100;
    if (amount !== Math.floor(amount)) throw new Error('Amount is not a whole number for these params');

    return {
        questionData: {
            price: P,
            percent: D
        },
        answer: Math.floor(amount)
    };
}

function validate(questionData, answer) {
    const { price, percent } = questionData;
    if (!price || !Number.isInteger(price) || price <= 0) return false;
    if (!percent || !Number.isInteger(percent) || percent <= 0) return false;

    const expected = (price * percent) / 100;
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
    const { price, percent } = questionData;
    const items = ['jacket', 'shirt', 'bag', 'pair of shoes', 'watch', 'saree', 'kurta', 'laptop bag', 'sweater', 'blazer'];
    const actions = [
        { verb: 'gives a discount of', label: 'discount' },
        { verb: 'charges a tax of', label: 'tax' },
        { verb: 'offers a cashback of', label: 'cashback' }
    ];
    const item = items[price % items.length];
    const action = actions[percent % actions.length];
    return `The price of a ${item} is ₹${price}. The shopkeeper ${action.verb} ${percent}%.\nWhat is the amount of the ${action.label}?`;
}

module.exports = {
    id:                   'pct_discount_tax_amount',
    name:                 'Percentage — Discount/Tax Amount',
    description:          'Given a price and a discount/tax percentage, find the amount of the discount/tax. (SOB/SOF medium1)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'percentages',
    tags:                 ["percentage","discount","tax"],
    gradeLevel:           '6-8',
    answerType:           'numeric'
};
