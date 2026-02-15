// ============================================================================
// RULE: Linear Equation — Notebook & Pen Combo (Medium 2, MCQ)
// ============================================================================
//
// "Notebook costs ₹NP, pen costs ₹PP.
//  Which combination costs exactly ₹Total?"
//
// Mathematical basis:
//   total = notebooks * notebookPrice + pens * penPrice
//   We generate notebooks, pens → compute total, then ask
//   "which combo costs this total?"
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    medium: {
        notebookPrice: { min: 50, max: 100 },
        penPrice:      { min: 20, max: 50 },
        notebooks:     { min: 20, max: 50 },
        pens:          { min: 20, max: 80 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.medium;

    const notebookPrice = (params && params.notebookPrice != null) ? params.notebookPrice : randomInt(cfg.notebookPrice.min, cfg.notebookPrice.max);
    const penPrice      = (params && params.penPrice != null)      ? params.penPrice      : randomInt(cfg.penPrice.min, cfg.penPrice.max);
    const notebooks     = (params && params.notebooks != null)     ? params.notebooks     : randomInt(cfg.notebooks.min, cfg.notebooks.max);
    const pens          = (params && params.pens != null)          ? params.pens          : randomInt(cfg.pens.min, cfg.pens.max);

    if (!Number.isInteger(notebookPrice) || notebookPrice <= 0) throw new Error('notebookPrice must be a positive integer');
    if (!Number.isInteger(penPrice) || penPrice <= 0) throw new Error('penPrice must be a positive integer');
    if (!Number.isInteger(notebooks) || notebooks <= 0) throw new Error('notebooks must be a positive integer');
    if (!Number.isInteger(pens) || pens <= 0) throw new Error('pens must be a positive integer');

    const totalAmount = notebooks * notebookPrice + pens * penPrice;

    return {
        questionData: {
            notebookPrice: notebookPrice,
            penPrice: penPrice,
            totalAmount: totalAmount,
            isMCQ: true
        },
        answer: { notebooks: notebooks, pens: pens }
    };
}

function validate(questionData, answer) {
    const { notebookPrice, penPrice, totalAmount } = questionData;
    if (!notebookPrice || !penPrice || !totalAmount) return false;
    if (!answer || answer.notebooks == null || answer.pens == null) return false;

    const computed = answer.notebooks * notebookPrice + answer.pens * penPrice;
    return computed === totalAmount;
}

function generateForDifficulty(difficultyKey) {
    const cfg = difficultyConfig[difficultyKey];
    if (!cfg) {
        throw new Error(`Unknown difficulty: "${difficultyKey}". Valid: ${Object.keys(difficultyConfig).join(', ')}`);
    }
    return generate({
        notebookPrice: randomInt(cfg.notebookPrice.min, cfg.notebookPrice.max),
        penPrice:      randomInt(cfg.penPrice.min, cfg.penPrice.max),
        notebooks:     randomInt(cfg.notebooks.min, cfg.notebooks.max),
        pens:          randomInt(cfg.pens.min, cfg.pens.max)
    });
}

function formatQuestion(questionData) {
    const { notebookPrice, penPrice, totalAmount } = questionData;
    return `The price of one notebook is ₹${notebookPrice} and the price of one pen is ₹${penPrice}.\nWhich of the following combinations costs exactly ₹${totalAmount}?`;
}

module.exports = {
    id:                   'le_notebook_pen_combo',
    name:                 'Linear Equation — Notebook & Pen Combo (MCQ)',
    description:          'Given notebook price, pen price, and total cost, find which combination of notebooks and pens matches. (Medium 2, MCQ)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty
};
