// ============================================================================
// RULE: Linear Equation — Notes with Ratio (Hard 1)
// ============================================================================
//
// "Bhumika has ₹totalAmount in note1 and note2 denominations.
//  The number of note1 is [ratio] times the number of note2.
//  How many note2 does she have?"
//
// Mathematical basis:
//   note1Count = ratio * note2Count
//   totalAmount = note1Count * note1 + note2Count * note2
//   totalAmount = note2Count * (ratio * note1 + note2)
//   note2Count  = totalAmount / (ratio * note1 + note2)
//
// ============================================================================

const { randomInt } = require('../utils');

const CURRENCY_PAIRS = [
    { values: [1, 5],   labels: ['₹1 coins', '₹5 coins'] },
    { values: [2, 5],   labels: ['₹2 coins', '₹5 coins'] },
    { values: [1, 10],  labels: ['₹1 coins', '₹10 notes'] },
    { values: [2, 10],  labels: ['₹2 coins', '₹10 notes'] },
    { values: [5, 20],  labels: ['₹5 coins', '₹20 notes'] },
    { values: [5, 50],  labels: ['₹5 coins', '₹50 notes'] },
    { values: [10, 50], labels: ['₹10 notes', '₹50 notes'] },
    { values: [10, 100],labels: ['₹10 notes', '₹100 notes'] },
    { values: [20, 100],labels: ['₹20 notes', '₹100 notes'] },
    { values: [50, 500],labels: ['₹50 notes', '₹500 notes'] },
    { values: [100,500],labels: ['₹100 notes', '₹500 notes'] }
];

const difficultyConfig = {
    hard: {
        ratio:      { min: 2, max: 4 },
        note2Count: { min: 5, max: 15 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.hard;

    let note1, note2, label1, label2, ratio, note2Count;

    if (params && params.note1 != null && params.note2 != null &&
        params.ratio != null && params.note2Count != null) {
        note1 = params.note1;
        note2 = params.note2;
        label1 = params.label1 || `₹${note1}`;
        label2 = params.label2 || `₹${note2}`;
        ratio = params.ratio;
        note2Count = params.note2Count;
    } else {
        const pair = CURRENCY_PAIRS[randomInt(0, CURRENCY_PAIRS.length - 1)];
        note1 = pair.values[0];
        note2 = pair.values[1];
        label1 = pair.labels[0];
        label2 = pair.labels[1];
        ratio = randomInt(cfg.ratio.min, cfg.ratio.max);
        note2Count = randomInt(cfg.note2Count.min, cfg.note2Count.max);
    }

    if (!Number.isInteger(note1) || note1 <= 0) throw new Error('note1 must be a positive integer');
    if (!Number.isInteger(note2) || note2 <= 0) throw new Error('note2 must be a positive integer');
    if (!Number.isInteger(ratio) || ratio <= 0) throw new Error('ratio must be a positive integer');
    if (!Number.isInteger(note2Count) || note2Count <= 0) throw new Error('note2Count must be a positive integer');

    const note1Count = ratio * note2Count;
    const totalAmount = (note1Count * note1) + (note2Count * note2);

    return {
        questionData: {
            note1: note1,
            note2: note2,
            label1: label1,
            label2: label2,
            totalAmount: totalAmount,
            ratio: ratio
        },
        answer: note2Count
    };
}

function validate(questionData, answer) {
    const { note1, note2, totalAmount, ratio } = questionData;
    if (!note1 || !note2 || !totalAmount || !ratio) return false;

    // note2Count = totalAmount / (ratio * note1 + note2)
    const denominator = ratio * note1 + note2;
    if (denominator === 0) return false;
    const expected = totalAmount / denominator;
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
    const { label1, label2, totalAmount, ratio } = questionData;
    const names = ['Bhumika', 'Priya', 'Sita'];
    const name = names[totalAmount % names.length];
    return `${name} has ₹${totalAmount}. All her money is in ${label1} and ${label2}.\nThe number of ${label1} is ${ratio} times the number of ${label2}.\nHow many ${label2} does she have?`;
}

module.exports = {
    id:                   'le_notes_with_ratio',
    name:                 'Linear Equation — Notes with Ratio',
    description:          'Given total amount in two denominations where count of one is a multiple of the other, find the count. (Hard 1)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty
};
