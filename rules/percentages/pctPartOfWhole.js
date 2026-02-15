// ============================================================================
// RULE: Percentage — Part of Whole (SOB/SOF)
// ============================================================================
//
// "In a class of X students, Y are absent. What is the percentage of absent
//  students?"  (Multiple context variations)
//
// Mathematical basis:
//   answer = (Y * 100) / X   (must be integer, no trailing zeros)
//
// ============================================================================

const { randomInt, hasTrailingZeros } = require('../utils');

const difficultyConfig = {
    easy: {
        total:  { min: 30, max: 100 },
        subset: { min: 5,  max: 95 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.easy;

    let X, Y;

    if (params && params.total != null && params.subset != null) {
        X = params.total;
        Y = params.subset;
    } else {
        let found = false;
        for (let i = 0; i < 1000; i++) {
            X = randomInt(cfg.total.min, cfg.total.max);
            Y = randomInt(5, X - 5);
            const pct = (Y * 100) / X;
            if (pct === Math.floor(pct) && !hasTrailingZeros(Math.floor(pct))) {
                found = true;
                break;
            }
        }
        if (!found) throw new Error('Could not find valid params within 1000 attempts');
    }

    if (!Number.isInteger(X) || X <= 0) throw new Error('total must be a positive integer');
    if (!Number.isInteger(Y) || Y <= 0 || Y >= X) throw new Error('subset must be between 1 and total-1');

    const percent = (Y * 100) / X;
    if (percent !== Math.floor(percent)) throw new Error('Percentage is not a whole number for these params');

    return {
        questionData: {
            total: X,
            subset: Y
        },
        answer: Math.floor(percent)
    };
}

function validate(questionData, answer) {
    const { total, subset } = questionData;
    if (!total || !Number.isInteger(total) || total <= 0) return false;
    if (!subset || !Number.isInteger(subset) || subset <= 0 || subset >= total) return false;

    const expected = (subset * 100) / total;
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
    const { total, subset } = questionData;
    // Multiple context variations, pick one based on total to stay deterministic
    const contexts = [
        `In a class of ${total} students, ${subset} students are absent.\nWhat is the percentage of absent students?`,
        `In a class of ${total} students, ${subset} are girls.\nWhat is the percentage of girls in the class?`,
        `Out of ${total} students who appeared for a test, ${subset} students failed.\nWhat is the percentage of students who failed?`,
        `A school has ${total} teachers. ${subset} of them teach science.\nWhat percentage of teachers teach science?`,
        `In a garden, there are ${total} flowers. ${subset} of them are red.\nWhat is the percentage of red flowers?`,
        `A library has ${total} books. ${subset} of them are fiction.\nWhat percentage of books are fiction?`
    ];
    return contexts[total % contexts.length];
}

module.exports = {
    id:                   'pct_part_of_whole',
    name:                 'Percentage — Part of Whole',
    description:          'Given a total and a subset count, find what percentage the subset is of the total. (SOB/SOF easy)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'percentages',
    tags:                 ["percentage","part","whole","absent"],
    gradeLevel:           '5-7',
    answerType:           'numeric'
};
