// ============================================================================
// RULE: Percentage — Population / Value Change (SOB/SOF)
// ============================================================================
//
// "The population of a village is P. It increased/decreased by R%.
//  What is the new population?"
//
// Mathematical basis:
//   change = (P * R) / 100      (must be integer)
//   answer = P + change   (increase)
//          = P - change   (decrease, must remain positive)
//   No trailing zeros in answer.
//
// ============================================================================

const { randomInt, hasTrailingZeros, randomIntNoTrailing } = require('../utils');

const difficultyConfig = {
    hard: {
        population: { min: 500,  max: 5000 },
        rate:       { min: 5,    max: 25 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.hard;

    let P, R, isIncrease;

    if (params && params.population != null && params.rate != null && params.isIncrease != null) {
        P = params.population;
        R = params.rate;
        isIncrease = params.isIncrease;
    } else {
        let found = false;
        for (let i = 0; i < 500; i++) {
            P = randomIntNoTrailing(cfg.population.min, cfg.population.max);
            R = randomInt(cfg.rate.min, cfg.rate.max);
            isIncrease = Math.random() < 0.5;

            const change = (P * R) / 100;
            if (change !== Math.floor(change)) continue;

            const newVal = isIncrease ? P + Math.floor(change) : P - Math.floor(change);
            if (newVal <= 0) continue;
            if (hasTrailingZeros(newVal)) continue;

            found = true;
            break;
        }
        if (!found) throw new Error('Could not find valid params within 500 attempts');
    }

    if (!Number.isInteger(P) || P <= 0) throw new Error('population must be a positive integer');
    if (!Number.isInteger(R) || R <= 0 || R > 100) throw new Error('rate must be between 1 and 100');

    const change = (P * R) / 100;
    if (change !== Math.floor(change)) throw new Error('Change amount is not a whole number');

    const answer = isIncrease ? P + Math.floor(change) : P - Math.floor(change);
    if (answer <= 0) throw new Error('Result must be positive');

    return {
        questionData: {
            population: P,
            rate: R,
            isIncrease: isIncrease,
            direction: isIncrease ? 'increased' : 'decreased'
        },
        answer: answer
    };
}

function validate(questionData, answer) {
    const { population, rate, isIncrease } = questionData;
    if (!population || !Number.isInteger(population) || population <= 0) return false;
    if (!rate || !Number.isInteger(rate) || rate <= 0) return false;

    const change = (population * rate) / 100;
    if (change !== Math.floor(change)) return false;

    const expected = isIncrease ? population + Math.floor(change) : population - Math.floor(change);
    return answer === expected;
}

function generateForDifficulty(difficultyKey) {
    const cfg = difficultyConfig[difficultyKey];
    if (!cfg) {
        throw new Error(`Unknown difficulty: "${difficultyKey}". Valid: ${Object.keys(difficultyConfig).join(', ')}`);
    }
    return generate();
}

function formatQuestion(questionData) {
    const { population, rate, direction } = questionData;
    const scenarios = [
        `The population of a village is ${population}.\nIn one year, it ${direction} by ${rate}%.\nWhat will be the new population?`,
        `The population of a town is ${population}.\nIn one year, it ${direction} by ${rate}%.\nWhat will be the new population?`,
        `A company has ${population} employees.\nThis year, the number ${direction} by ${rate}%.\nWhat is the new number of employees?`,
        `The number of students in a school is ${population}.\nNext year, it ${direction} by ${rate}%.\nWhat will be the new number of students?`,
        `The price of a plot of land is ₹${population}.\nIn one year, the price ${direction} by ${rate}%.\nWhat is the new price?`
    ];
    return scenarios[population % scenarios.length];
}

module.exports = {
    id:                   'pct_population_change',
    name:                 'Percentage — Population/Value Change',
    description:          'Given a population/value and a percentage change (increase or decrease), find the new value. (SOB/SOF hard)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty
};
