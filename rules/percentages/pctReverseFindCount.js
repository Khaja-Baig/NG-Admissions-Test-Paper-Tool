// ============================================================================
// RULE: Percentage — Reverse (Find how many to add) (SOP/BCA)
// ============================================================================
//
// "Arman has X red ribbons and Y blue ribbons.
//  How many blue ribbons should he buy so that blue ribbons become P%?"
//
// Mathematical basis:
//   (Y + B) / (X + Y + B) = P / 100
//   100(Y + B) = P(X + Y + B)
//   100Y + 100B = PX + PY + PB
//   B(100 - P) = PX + PY - 100Y
//   B = (PX + PY - 100Y) / (100 - P)
//   B must be a positive integer.
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    hard: {
        redCount:  { min: 20, max: 50 },
        blueCount: { min: 5,  max: 30 },
        allowedPercents: [20, 25, 28, 34, 38, 40, 45, 50]
    }
};

function generate(params) {
    const cfg = difficultyConfig.hard;

    let X, Y, P;

    if (params && params.redCount != null && params.blueCount != null && params.targetPercent != null) {
        X = params.redCount;
        Y = params.blueCount;
        P = params.targetPercent;
    } else {
        let found = false;
        for (let i = 0; i < 300; i++) {
            X = randomInt(cfg.redCount.min, cfg.redCount.max);
            Y = randomInt(cfg.blueCount.min, cfg.blueCount.max);
            P = cfg.allowedPercents[randomInt(0, cfg.allowedPercents.length - 1)];

            const numerator = P * X + P * Y - 100 * Y;
            const denominator = 100 - P;
            if (denominator === 0 || numerator <= 0) continue;
            if (numerator % denominator !== 0) continue;
            const B = numerator / denominator;
            if (B > 0 && B === Math.floor(B)) { found = true; break; }
        }
        if (!found) throw new Error('Could not find valid params within 300 attempts');
    }

    if (!Number.isInteger(X) || X <= 0) throw new Error('redCount must be a positive integer');
    if (!Number.isInteger(Y) || Y <= 0) throw new Error('blueCount must be a positive integer');
    if (!Number.isInteger(P) || P <= 0 || P >= 100) throw new Error('targetPercent must be an integer between 1 and 99');

    const numerator = P * X + P * Y - 100 * Y;
    const denominator = 100 - P;
    if (denominator === 0 || numerator <= 0 || numerator % denominator !== 0) {
        throw new Error('No valid integer solution for these params');
    }
    const B = numerator / denominator;
    if (B <= 0 || B !== Math.floor(B)) {
        throw new Error('Solution B must be a positive integer');
    }

    return {
        questionData: {
            redCount: X,
            blueCount: Y,
            targetPercent: P
        },
        answer: B
    };
}

function validate(questionData, answer) {
    const { redCount, blueCount, targetPercent } = questionData;
    if (!redCount || !blueCount || !targetPercent) return false;

    const total = redCount + blueCount + answer;
    const blueTotal = blueCount + answer;
    const percent = (blueTotal * 100) / total;

    return percent === targetPercent;
}

function generateForDifficulty(difficultyKey) {
    const cfg = difficultyConfig[difficultyKey];
    if (!cfg) {
        throw new Error(`Unknown difficulty: "${difficultyKey}". Valid: ${Object.keys(difficultyConfig).join(', ')}`);
    }
    return generate();
}

function formatQuestion(questionData) {
    const { redCount, blueCount, targetPercent } = questionData;
    return `Arman has ${redCount} red ribbons and ${blueCount} blue ribbons.\nHow many blue ribbons should he buy so that the percentage of blue ribbons becomes ${targetPercent}%?`;
}

module.exports = {
    id:                   'pct_reverse_find_count',
    name:                 'Percentage — Reverse (Find Count to Add)',
    description:          'Given red and blue items, find how many blue items to add so blue items reach a target percentage.',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'percentages',
    tags:                 ["percentage","reverse","find count"],
    gradeLevel:           '7-9',
    answerType:           'numeric'
};
