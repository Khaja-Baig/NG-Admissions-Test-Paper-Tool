// ============================================================================
// RULE: Constant Difference (Arithmetic Sequence)
// ============================================================================
//
// Generates a number pattern where consecutive terms differ by a fixed value.
// The last term is hidden and the student must find it.
//
// Mathematical basis:
//   Given: start (a), common difference (d), sequence length (n)
//   Sequence: a, a+d, a+2d, a+3d, ..., a+(n-1)d
//   The question shows the first (n) terms and asks for term (n+1).
//   Answer: a + n*d
//
// ============================================================================

const { randomInt } = require('./utils');

// ----------------------------------------------------------------------------
// Difficulty configuration
// ----------------------------------------------------------------------------
// Defines parameter ranges for each difficulty level.
// The platform can use these to auto-generate params.

const difficultyConfig = {
    easy: {
        start:      { min: 1,  max: 20 },
        difference: { min: 2,  max: 5 },
        length:     { min: 4,  max: 5 }
    },
    medium: {
        start:      { min: 10, max: 50 },
        difference: { min: 3,  max: 9 },
        length:     { min: 4,  max: 6 }
    },
    hard: {
        start:      { min: 5,  max: 100 },
        difference: { min: 7,  max: 15 },
        length:     { min: 5,  max: 7 }
    }
};

// ----------------------------------------------------------------------------
// generate(params)
// ----------------------------------------------------------------------------
// Creates one question instance.
//
// @param {Object} [params] — Optional. If omitted, random values are picked
//                             from the 'easy' difficulty range.
//   @param {number} params.start      — First term of the sequence.
//   @param {number} params.difference — Common difference between terms.
//   @param {number} params.length     — Number of visible terms shown to student.
//
// @returns {Object} { questionData, answer }
//   questionData.sequence    {number[]} — The visible terms.
//   questionData.missingIndex {number}  — The 1-based index of the missing term
//                                         (always length + 1).
//   answer                   {number}   — The correct next term.

function generate(params) {
    // If no params provided, pick random values from 'easy' config
    const cfg = difficultyConfig.easy;
    const start      = (params && params.start      != null) ? params.start      : randomInt(cfg.start.min, cfg.start.max);
    const difference = (params && params.difference  != null) ? params.difference : randomInt(cfg.difference.min, cfg.difference.max);
    const length     = (params && params.length      != null) ? params.length     : randomInt(cfg.length.min, cfg.length.max);

    // Validate inputs
    if (!Number.isInteger(start))      throw new Error('start must be an integer');
    if (!Number.isInteger(difference)) throw new Error('difference must be an integer');
    if (difference <= 0)               throw new Error('difference must be a positive integer');
    if (!Number.isInteger(length))     throw new Error('length must be an integer');
    if (length < 2)                    throw new Error('length must be at least 2');

    // Build the visible sequence
    const sequence = [];
    for (let i = 0; i < length; i++) {
        sequence.push(start + i * difference);
    }

    // The answer is the next term after the visible sequence
    const answer = start + length * difference;

    return {
        questionData: {
            sequence: sequence,
            missingIndex: length + 1   // 1-based position of the missing term
        },
        answer: answer
    };
}

// ----------------------------------------------------------------------------
// validate(questionData, answer)
// ----------------------------------------------------------------------------
// Deterministically checks whether the given answer is correct.
//
// Logic:
//   1. Verify the visible sequence has a constant difference.
//   2. Compute the expected next term using that constant difference.
//   3. Compare with the provided answer.
//
// @param {Object} questionData — As returned by generate().
// @param {number} answer       — The answer to check.
// @returns {boolean} true if correct, false otherwise.

function validate(questionData, answer) {
    const seq = questionData.sequence;

    // Must have at least 2 terms to determine a difference
    if (!Array.isArray(seq) || seq.length < 2) return false;

    // Check that every consecutive pair has the same difference
    const d = seq[1] - seq[0];
    for (let i = 2; i < seq.length; i++) {
        if (seq[i] - seq[i - 1] !== d) return false;
    }

    // The expected next term
    const expected = seq[seq.length - 1] + d;

    return answer === expected;
}

// ----------------------------------------------------------------------------
// generateForDifficulty(difficultyKey)
// ----------------------------------------------------------------------------
// Convenience wrapper. Picks random params from the specified difficulty
// range and calls generate().
//
// @param {string} difficultyKey — 'easy', 'medium', or 'hard'
// @returns {Object} { questionData, answer }

function generateForDifficulty(difficultyKey) {
    const cfg = difficultyConfig[difficultyKey];
    if (!cfg) {
        throw new Error(`Unknown difficulty: "${difficultyKey}". Valid: ${Object.keys(difficultyConfig).join(', ')}`);
    }

    return generate({
        start:      randomInt(cfg.start.min, cfg.start.max),
        difference: randomInt(cfg.difference.min, cfg.difference.max),
        length:     randomInt(cfg.length.min, cfg.length.max)
    });
}

// ----------------------------------------------------------------------------
// formatQuestion(questionData)
// ----------------------------------------------------------------------------
// Converts questionData into a human-readable question string.
//
// @param {Object} questionData — As returned by generate().
// @returns {string} The question text ready for display/PDF.

function formatQuestion(questionData) {
    const seq = questionData.sequence;
    const sequence = seq.join(', ') + ', ___';
    return `What will be the next term in the pattern?\n${sequence}`;
}

// ----------------------------------------------------------------------------
// Module export — conforms to the Rule Interface Contract
// ----------------------------------------------------------------------------

module.exports = {
    id:                   'constant_difference',
    name:                 'Constant Difference Pattern',
    description:          'Generates an arithmetic sequence where consecutive terms differ by a fixed value. The student must find the next term.',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'number patterns',
    tags:                 ["arithmetic","sequence","pattern"],
    gradeLevel:           '5-7',
    answerType:           'numeric'
};
