// ============================================================================
// SHARED UTILITY FUNCTIONS
// ============================================================================
//
// Common helpers used across multiple rule files and the browser UI.
// Centralised here to eliminate duplication (~28 copies of randomInt, etc.).
//
// Usage in rule files:
//   const { randomInt, hasTrailingZeros, randomIntNoTrailing } = require('./utils');
//   // or require('../utils') from sub-folders
//
// These are also exported via the bundle so script.js can use them as
// RuleEngine.utils.randomInt(...) etc.
//
// ============================================================================

/**
 * Generate a random integer between min and max (inclusive).
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if a number ends in zero (e.g. 120, 450).
 * Returns false for 0 itself.
 */
function hasTrailingZeros(n) {
    if (n === 0) return false;
    return n % 10 === 0;
}

/**
 * Generate a random integer between min and max (inclusive) that does NOT
 * end in zero.  Falls back after 100 attempts.
 */
function randomIntNoTrailing(min, max) {
    let val;
    for (let i = 0; i < 100; i++) {
        val = randomInt(min, max);
        if (!hasTrailingZeros(val)) return val;
    }
    return val;   // last-resort fallback
}

/**
 * Fisher–Yates shuffle — returns a NEW array (does not mutate the input).
 */
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Generate `count` unique distractor values near `correct`.
 * Distractors are positive, ≠ correct, and have no trailing zeros.
 */
function generateDistractors(correct, count = 3) {
    const distractors = new Set();
    const range = Math.max(Math.abs(correct * 0.3), 10);

    let attempts = 0;
    while (distractors.size < count && attempts < 1000) {
        const offset = randomInt(1, Math.ceil(range));
        const distractor = Math.random() < 0.5
            ? correct + offset
            : correct - offset;

        if (distractor > 0 && distractor !== correct && !hasTrailingZeros(distractor)) {
            distractors.add(distractor);
        }
        attempts++;
    }

    return Array.from(distractors).slice(0, count);
}

/**
 * Build 4 shuffled MCQ options (A–D) around a numeric `correct` answer.
 * Returns { options: number[], correctLetter: 'A'|'B'|'C'|'D' }.
 */
function createOptions(correct) {
    const distractors = generateDistractors(correct, 3);
    const options = [correct, ...distractors];
    const shuffled = shuffle(options);
    const correctIndex = shuffled.indexOf(correct);
    const correctLetter = String.fromCharCode(65 + correctIndex);
    return { options: shuffled, correctLetter };
}

module.exports = {
    randomInt,
    hasTrailingZeros,
    randomIntNoTrailing,
    shuffle,
    generateDistractors,
    createOptions
};
