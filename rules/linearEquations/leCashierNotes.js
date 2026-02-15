// ============================================================================
// RULE: Linear Equation — Cashier Notes/Coins (Medium 1, MCQ)
// ============================================================================
//
// "A cashier has ₹totalAmount in note1 and note2 denominations.
//  Total notes/coins = totalNotes. Find how many of each."
//
// Mathematical basis:
//   x * note1 + y * note2 = totalAmount
//   x + y = totalNotes
//   → x = (note2 * totalNotes - totalAmount) / (note2 - note1)
//   → y = totalNotes - x
//   Both must be positive integers.
//
// This is an MCQ rule — the answer is a string "x of label1 and y of label2".
//
// ============================================================================

const { randomInt } = require('../utils');

const CURRENCY_PAIRS = [
    { values: [1, 2],   labels: ['₹1 coins', '₹2 coins'] },
    { values: [1, 5],   labels: ['₹1 coins', '₹5 coins'] },
    { values: [2, 5],   labels: ['₹2 coins', '₹5 coins'] },
    { values: [5, 10],  labels: ['₹5 coins', '₹10 notes'] },
    { values: [5, 20],  labels: ['₹5 coins', '₹20 notes'] },
    { values: [10, 20], labels: ['₹10 notes', '₹20 notes'] },
    { values: [10, 50], labels: ['₹10 notes', '₹50 notes'] },
    { values: [20, 50], labels: ['₹20 notes', '₹50 notes'] },
    { values: [50, 100],labels: ['₹50 notes', '₹100 notes'] },
    { values: [100,500],labels: ['₹100 notes', '₹500 notes'] }
];

const difficultyConfig = {
    medium: {
        totalNotes: { min: 100, max: 200 },
        pairIndex:  { min: 0,   max: CURRENCY_PAIRS.length - 1 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.medium;

    let note1, note2, label1, label2, totalNotes, totalAmount;

    if (params && params.note1 != null && params.note2 != null &&
        params.totalNotes != null && params.totalAmount != null) {
        note1 = params.note1;
        note2 = params.note2;
        label1 = params.label1 || `₹${note1}`;
        label2 = params.label2 || `₹${note2}`;
        totalNotes = params.totalNotes;
        totalAmount = params.totalAmount;
    } else {
        let found = false;
        for (let i = 0; i < 300; i++) {
            const pair = CURRENCY_PAIRS[randomInt(0, CURRENCY_PAIRS.length - 1)];
            note1 = pair.values[0];
            note2 = pair.values[1];
            label1 = pair.labels[0];
            label2 = pair.labels[1];
            totalNotes = randomInt(cfg.totalNotes.min, cfg.totalNotes.max);
            totalAmount = randomInt(note1 * 20, note2 * totalNotes);

            const x = (note2 * totalNotes - totalAmount) / (note2 - note1);
            const y = totalNotes - x;
            if (x === Math.floor(x) && y === Math.floor(y) && x > 0 && y > 0) {
                found = true;
                break;
            }
        }
        if (!found) throw new Error('Could not find valid params within 300 attempts');
    }

    if (!Number.isInteger(note1) || note1 <= 0) throw new Error('note1 must be a positive integer');
    if (!Number.isInteger(note2) || note2 <= 0) throw new Error('note2 must be a positive integer');
    if (note1 >= note2) throw new Error('note1 must be less than note2');

    const x = (note2 * totalNotes - totalAmount) / (note2 - note1);
    const y = totalNotes - x;
    if (x !== Math.floor(x) || y !== Math.floor(y) || x <= 0 || y <= 0) {
        throw new Error('No valid positive integer solution');
    }

    return {
        questionData: {
            note1: note1,
            note2: note2,
            label1: label1,
            label2: label2,
            totalAmount: totalAmount,
            totalNotes: totalNotes,
            isMCQ: true
        },
        answer: { count1: Math.floor(x), count2: Math.floor(y) }
    };
}

function validate(questionData, answer) {
    const { note1, note2, totalAmount, totalNotes } = questionData;
    if (!note1 || !note2 || !totalAmount || !totalNotes) return false;
    if (!answer || answer.count1 == null || answer.count2 == null) return false;

    const c1 = answer.count1;
    const c2 = answer.count2;

    return (c1 + c2 === totalNotes) && (c1 * note1 + c2 * note2 === totalAmount);
}

function generateForDifficulty(difficultyKey) {
    const cfg = difficultyConfig[difficultyKey];
    if (!cfg) {
        throw new Error(`Unknown difficulty: "${difficultyKey}". Valid: ${Object.keys(difficultyConfig).join(', ')}`);
    }
    return generate();
}

function formatQuestion(questionData) {
    const { label1, label2, totalAmount, totalNotes } = questionData;
    return `A cashier has ₹${totalAmount} in total. The money is only in ${label1} and ${label2}.\nThere are ${totalNotes} coins/notes altogether. How many ${label1} and ${label2} can she have from the following?`;
}

module.exports = {
    id:                   'le_cashier_notes',
    name:                 'Linear Equation — Cashier Notes/Coins (MCQ)',
    description:          'Given total amount and total note/coin count in two denominations, find how many of each. (Medium 1, MCQ)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'linear equations',
    tags:                 ["equation","cashier","notes","mcq"],
    gradeLevel:           '7-9',
    answerType:           'mcq'
};
