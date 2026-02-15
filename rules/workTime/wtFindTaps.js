// ============================================================================
// RULE: Work & Time — Find Taps (Medium)
// ============================================================================
//
// "To fill G1 glasses, T1 taps take M1 minutes.
//  To fill G2 glasses in M2 minutes, how many taps are needed?"
//
// Mathematical basis:
//   Rate per tap per minute = G1 / (T1 * M1)
//   T2 = G2 / (rate * M2) = (T1 * M1 * G2) / (G1 * M2)
//   Must be a positive integer.
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    medium: {
        glasses1: { min: 10, max: 40 },
        taps1:    { min: 2,  max: 6 },
        minutes1: { min: 5,  max: 25 },
        glasses2: { min: 10, max: 40 },
        minutes2: { min: 5,  max: 25 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.medium;

    let G1, T1, M1, G2, M2;

    if (params && params.glasses1 != null && params.taps1 != null && params.minutes1 != null &&
        params.glasses2 != null && params.minutes2 != null) {
        G1 = params.glasses1;
        T1 = params.taps1;
        M1 = params.minutes1;
        G2 = params.glasses2;
        M2 = params.minutes2;
    } else {
        let found = false;
        for (let i = 0; i < 300; i++) {
            G1 = randomInt(cfg.glasses1.min, cfg.glasses1.max);
            T1 = randomInt(cfg.taps1.min, cfg.taps1.max);
            M1 = randomInt(cfg.minutes1.min, cfg.minutes1.max);
            G2 = randomInt(cfg.glasses2.min, cfg.glasses2.max);
            M2 = randomInt(cfg.minutes2.min, cfg.minutes2.max);

            const T2 = (T1 * M1 * G2) / (G1 * M2);
            if (T2 === Math.floor(T2) && T2 > 0) { found = true; break; }
        }
        if (!found) throw new Error('Could not find valid params within 300 attempts');
    }

    if (!Number.isInteger(G1) || G1 <= 0) throw new Error('glasses1 must be a positive integer');
    if (!Number.isInteger(T1) || T1 <= 0) throw new Error('taps1 must be a positive integer');
    if (!Number.isInteger(M1) || M1 <= 0) throw new Error('minutes1 must be a positive integer');
    if (!Number.isInteger(G2) || G2 <= 0) throw new Error('glasses2 must be a positive integer');
    if (!Number.isInteger(M2) || M2 <= 0) throw new Error('minutes2 must be a positive integer');

    const T2 = (T1 * M1 * G2) / (G1 * M2);
    if (T2 !== Math.floor(T2) || T2 <= 0) throw new Error('Result taps is not a positive integer');

    return {
        questionData: {
            glasses1: G1,
            taps1: T1,
            minutes1: M1,
            glasses2: G2,
            minutes2: M2
        },
        answer: Math.floor(T2)
    };
}

function validate(questionData, answer) {
    const { glasses1, taps1, minutes1, glasses2, minutes2 } = questionData;
    if (!glasses1 || !taps1 || !minutes1 || !glasses2 || !minutes2) return false;

    const expected = (taps1 * minutes1 * glasses2) / (glasses1 * minutes2);
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
    const { glasses1, taps1, minutes1, glasses2, minutes2 } = questionData;
    return `To fill ${glasses1} glasses, ${taps1} taps take ${minutes1} minutes.\nTo fill ${glasses2} glasses in ${minutes2} minutes, how many taps are needed?`;
}

module.exports = {
    id:                   'wt_find_taps',
    name:                 'Work & Time — Find Taps Needed',
    description:          'Given two scenarios with glasses, taps, and time, find the number of taps needed for the second scenario. (Medium)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'work and time',
    tags:                 ["work","taps","fill"],
    gradeLevel:           '6-8',
    answerType:           'numeric'
};
