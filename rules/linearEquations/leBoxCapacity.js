// ============================================================================
// RULE: Linear Equation — Box Capacity (Easy 2)
// ============================================================================
//
// "Yellow boxes hold Y books each, Brown boxes hold B books each.
//  Uses YC yellow and BC brown boxes. Total books?"
//
// Mathematical basis:
//   answer = (yellowCap * yellowCount) + (brownCap * brownCount)
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    easy: {
        yellowCap:   { min: 60, max: 100 },
        brownCap:    { min: 50, max: 90 },
        yellowCount: { min: 4,  max: 8 },
        brownCount:  { min: 5,  max: 10 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.easy;

    const yellowCap   = (params && params.yellowCap != null)   ? params.yellowCap   : randomInt(cfg.yellowCap.min, cfg.yellowCap.max);
    const brownCap    = (params && params.brownCap != null)    ? params.brownCap    : randomInt(cfg.brownCap.min, cfg.brownCap.max);
    const yellowCount = (params && params.yellowCount != null) ? params.yellowCount : randomInt(cfg.yellowCount.min, cfg.yellowCount.max);
    const brownCount  = (params && params.brownCount != null)  ? params.brownCount  : randomInt(cfg.brownCount.min, cfg.brownCount.max);

    if (!Number.isInteger(yellowCap) || yellowCap <= 0)   throw new Error('yellowCap must be a positive integer');
    if (!Number.isInteger(brownCap) || brownCap <= 0)     throw new Error('brownCap must be a positive integer');
    if (!Number.isInteger(yellowCount) || yellowCount <= 0) throw new Error('yellowCount must be a positive integer');
    if (!Number.isInteger(brownCount) || brownCount <= 0)  throw new Error('brownCount must be a positive integer');

    const total = (yellowCap * yellowCount) + (brownCap * brownCount);

    return {
        questionData: {
            yellowCap: yellowCap,
            brownCap: brownCap,
            yellowCount: yellowCount,
            brownCount: brownCount
        },
        answer: total
    };
}

function validate(questionData, answer) {
    const { yellowCap, brownCap, yellowCount, brownCount } = questionData;
    if (!yellowCap || !brownCap || !yellowCount || !brownCount) return false;

    const expected = (yellowCap * yellowCount) + (brownCap * brownCount);
    return answer === expected;
}

function generateForDifficulty(difficultyKey) {
    const cfg = difficultyConfig[difficultyKey];
    if (!cfg) {
        throw new Error(`Unknown difficulty: "${difficultyKey}". Valid: ${Object.keys(difficultyConfig).join(', ')}`);
    }
    return generate({
        yellowCap:   randomInt(cfg.yellowCap.min, cfg.yellowCap.max),
        brownCap:    randomInt(cfg.brownCap.min, cfg.brownCap.max),
        yellowCount: randomInt(cfg.yellowCount.min, cfg.yellowCount.max),
        brownCount:  randomInt(cfg.brownCount.min, cfg.brownCount.max)
    });
}

function formatQuestion(questionData) {
    const { yellowCap, brownCap, yellowCount, brownCount } = questionData;
    const names = ['Rahul', 'Priya', 'Arman'];
    const name = names[yellowCap % names.length];
    const pronoun = name === 'Priya' ? 'She' : 'He';
    const pronounLower = name === 'Priya' ? 'she' : 'he';
    return `${name} has two types of boxes.\nYellow boxes can hold ${yellowCap} books each and Brown boxes can hold ${brownCap} books each. ${pronoun} uses ${yellowCount} Yellow boxes and ${brownCount} Brown boxes.\nHow many books can ${pronounLower} pack in total?`;
}

module.exports = {
    id:                   'le_box_capacity',
    name:                 'Linear Equation — Box Capacity',
    description:          'Given box capacities and counts of two box types, find total books that can be packed. (Easy 2)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty
};
