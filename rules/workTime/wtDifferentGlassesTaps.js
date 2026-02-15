// ============================================================================
// RULE: Work & Time — Different Glasses & Taps (Hard)
// ============================================================================
//
// "To fill G1 glasses, T1 taps take M1 minutes.
//  With T2 taps, how much time is needed to fill G2 glasses?"
//
// Mathematical basis:
//   Rate per tap per minute = G1 / (T1 * M1)
//   M2 = G2 / (rate * T2) = (T1 * M1 * G2) / (G1 * T2)
//   Must be a positive integer.
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    hard: {
        glasses1: { min: 10, max: 30 },
        taps1:    { min: 2,  max: 6 },
        minutes1: { min: 5,  max: 20 },
        glasses2: { min: 10, max: 30 },
        taps2:    { min: 2,  max: 6 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.hard;

    let G1, T1, M1, G2, T2;

    if (params && params.glasses1 != null && params.taps1 != null && params.minutes1 != null &&
        params.glasses2 != null && params.taps2 != null) {
        G1 = params.glasses1;
        T1 = params.taps1;
        M1 = params.minutes1;
        G2 = params.glasses2;
        T2 = params.taps2;
    } else {
        let found = false;
        for (let i = 0; i < 300; i++) {
            G1 = randomInt(cfg.glasses1.min, cfg.glasses1.max);
            T1 = randomInt(cfg.taps1.min, cfg.taps1.max);
            M1 = randomInt(cfg.minutes1.min, cfg.minutes1.max);
            G2 = randomInt(cfg.glasses2.min, cfg.glasses2.max);
            T2 = randomInt(cfg.taps2.min, cfg.taps2.max);

            const M2 = (T1 * M1 * G2) / (G1 * T2);
            if (M2 === Math.floor(M2) && M2 > 0) { found = true; break; }
        }
        if (!found) throw new Error('Could not find valid params within 300 attempts');
    }

    if (!Number.isInteger(G1) || G1 <= 0) throw new Error('glasses1 must be a positive integer');
    if (!Number.isInteger(T1) || T1 <= 0) throw new Error('taps1 must be a positive integer');
    if (!Number.isInteger(M1) || M1 <= 0) throw new Error('minutes1 must be a positive integer');
    if (!Number.isInteger(G2) || G2 <= 0) throw new Error('glasses2 must be a positive integer');
    if (!Number.isInteger(T2) || T2 <= 0) throw new Error('taps2 must be a positive integer');

    const M2 = (T1 * M1 * G2) / (G1 * T2);
    if (M2 !== Math.floor(M2) || M2 <= 0) throw new Error('Result time is not a positive integer');

    return {
        questionData: {
            glasses1: G1,
            taps1: T1,
            minutes1: M1,
            glasses2: G2,
            taps2: T2
        },
        answer: Math.floor(M2)
    };
}

function validate(questionData, answer) {
    const { glasses1, taps1, minutes1, glasses2, taps2 } = questionData;
    if (!glasses1 || !taps1 || !minutes1 || !glasses2 || !taps2) return false;

    const expected = (taps1 * minutes1 * glasses2) / (glasses1 * taps2);
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
    const { glasses1, taps1, minutes1, glasses2, taps2 } = questionData;
    return `To fill ${glasses1} glasses, ${taps1} taps take ${minutes1} minutes.\nWith ${taps2} taps, how much time is needed to fill ${glasses2} glasses?`;
}

module.exports = {
    id:                   'wt_different_glasses_taps',
    name:                 'Work & Time — Different Glasses & Taps',
    description:          'Given glasses, taps, and time for one scenario, find the time needed with different taps and glasses. (Hard)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'work and time',
    tags:                 ["work","glasses","taps","rate"],
    gradeLevel:           '7-9',
    answerType:           'numeric'
};
