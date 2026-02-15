// ============================================================================
// RULE: Linear Equation — Bus Capacity (Easy 1)
// ============================================================================
//
// "Red bus has X seats, Green bus has Y seats.
//  School arranges R red buses and G green buses.
//  How many people can travel?"
//
// Mathematical basis:
//   answer = (redSeats * redCount) + (greenSeats * greenCount)
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    easy: {
        redSeats:   { min: 60, max: 100 },
        greenSeats: { min: 50, max: 90 },
        redCount:   { min: 3,  max: 7 },
        greenCount: { min: 4,  max: 8 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.easy;

    const redSeats   = (params && params.redSeats != null)   ? params.redSeats   : randomInt(cfg.redSeats.min, cfg.redSeats.max);
    const greenSeats = (params && params.greenSeats != null) ? params.greenSeats : randomInt(cfg.greenSeats.min, cfg.greenSeats.max);
    const redCount   = (params && params.redCount != null)   ? params.redCount   : randomInt(cfg.redCount.min, cfg.redCount.max);
    const greenCount = (params && params.greenCount != null) ? params.greenCount : randomInt(cfg.greenCount.min, cfg.greenCount.max);

    if (!Number.isInteger(redSeats) || redSeats <= 0)   throw new Error('redSeats must be a positive integer');
    if (!Number.isInteger(greenSeats) || greenSeats <= 0) throw new Error('greenSeats must be a positive integer');
    if (!Number.isInteger(redCount) || redCount <= 0)   throw new Error('redCount must be a positive integer');
    if (!Number.isInteger(greenCount) || greenCount <= 0) throw new Error('greenCount must be a positive integer');

    const total = (redSeats * redCount) + (greenSeats * greenCount);

    return {
        questionData: {
            redSeats: redSeats,
            greenSeats: greenSeats,
            redCount: redCount,
            greenCount: greenCount
        },
        answer: total
    };
}

function validate(questionData, answer) {
    const { redSeats, greenSeats, redCount, greenCount } = questionData;
    if (!redSeats || !greenSeats || !redCount || !greenCount) return false;

    const expected = (redSeats * redCount) + (greenSeats * greenCount);
    return answer === expected;
}

function generateForDifficulty(difficultyKey) {
    const cfg = difficultyConfig[difficultyKey];
    if (!cfg) {
        throw new Error(`Unknown difficulty: "${difficultyKey}". Valid: ${Object.keys(difficultyConfig).join(', ')}`);
    }
    return generate({
        redSeats:   randomInt(cfg.redSeats.min, cfg.redSeats.max),
        greenSeats: randomInt(cfg.greenSeats.min, cfg.greenSeats.max),
        redCount:   randomInt(cfg.redCount.min, cfg.redCount.max),
        greenCount: randomInt(cfg.greenCount.min, cfg.greenCount.max)
    });
}

function formatQuestion(questionData) {
    const { redSeats, greenSeats, redCount, greenCount } = questionData;
    return `A Red bus has ${redSeats} seats, whereas Green bus has ${greenSeats} seats.\nThe school arranges for ${redCount} Red buses and ${greenCount} Green buses.\nHow many people can travel in total?`;
}

module.exports = {
    id:                   'le_bus_capacity',
    name:                 'Linear Equation — Bus Capacity',
    description:          'Given seat capacities and counts of two bus types, find total passenger capacity. (Easy 1)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty
};
