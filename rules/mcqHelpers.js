// ============================================================================
// MCQ OPTION HELPERS
// ============================================================================
//
// Functions for generating and shuffling MCQ options for string-based
// correct answers (used by linear-equations MCQ rules like leCashierNotes,
// leNotebookPenCombo).
//
// Numeric answer MCQ options are handled by utils.createOptions().
//
// ============================================================================

const { randomInt, shuffle } = require('./utils');

/**
 * Generate 4 MCQ options for a string-based correctAnswer that contains
 * two numbers (e.g. "12 of ₹500-notes and 8 of ₹100-notes").
 *
 * Extracts the two numbers, perturbs them to create 3 distractors,
 * and returns an array of 4 option strings.
 */
function generateMCQOptions(correctAnswer) {
    const options = [correctAnswer];

    const match = correctAnswer.match(/(\d+)[^\d]+(\d+)/);
    if (match) {
        const num1 = parseInt(match[1]);
        const num2 = parseInt(match[2]);

        for (let i = 0; i < 3; i++) {
            let var1, var2;
            do {
                const offset = randomInt(5, 20);
                if (Math.random() < 0.5) {
                    var1 = num1 + offset;
                    var2 = num2 - offset;
                } else {
                    var1 = num1 - offset;
                    var2 = num2 + offset;
                }
            } while (var1 <= 0 || var2 <= 0);

            // Replace the first two number occurrences in the template string
            const newOption = correctAnswer.replace(/\d+/, var1).replace(/\d+/, var2);
            if (!options.includes(newOption)) {
                options.push(newOption);
            }
        }
    }

    // Fill remaining with fallback variants if needed
    while (options.length < 4) {
        options.push(correctAnswer + ' (variant)');
    }

    return options.slice(0, 4);
}

/**
 * Shuffle an array of option strings and return the shuffled array
 * together with the letter (A–D) that corresponds to the correct answer.
 */
function shuffleOptionsWithAnswer(options, correctAnswer) {
    const shuffled = shuffle(options);
    const correctIndex = shuffled.indexOf(correctAnswer);
    const correctLetter = String.fromCharCode(65 + correctIndex);
    return { options: shuffled, correctLetter };
}

module.exports = {
    generateMCQOptions,
    shuffleOptionsWithAnswer
};
