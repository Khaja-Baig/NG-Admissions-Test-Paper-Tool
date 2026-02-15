// ============================================================================
// RULE: Work & Time — Find Time (Easy)
// ============================================================================
//
// "To fill G glasses, T1 taps take M1 minutes.
//  With T2 taps, how much time is needed to fill G glasses?"
//
// Mathematical basis:
//   Work rate: G glasses / (T1 taps * M1 minutes) = rate per tap per minute
//   New time:  M2 = (T1 * M1) / T2     (must be integer)
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    easy: {
        glasses: { min: 10, max: 50 },
        taps1:   { min: 2,  max: 8 },
        minutes1:{ min: 5,  max: 30 },
        taps2:   { min: 2,  max: 8 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.easy;

    let G, T1, M1, T2;

    if (params && params.glasses != null && params.taps1 != null && params.minutes1 != null && params.taps2 != null) {
        G = params.glasses;
        T1 = params.taps1;
        M1 = params.minutes1;
        T2 = params.taps2;
    } else {
        let found = false;
        for (let i = 0; i < 1000; i++) {
            G = randomInt(cfg.glasses.min, cfg.glasses.max);
            T1 = randomInt(cfg.taps1.min, cfg.taps1.max);
            M1 = randomInt(cfg.minutes1.min, cfg.minutes1.max);
            T2 = randomInt(cfg.taps2.min, cfg.taps2.max);
            if (T2 === T1) continue;
            const M2 = (T1 * M1) / T2;
            if (M2 === Math.floor(M2) && M2 > 0) { found = true; break; }
        }
        if (!found) throw new Error('Could not find valid params within 1000 attempts');
    }

    if (!Number.isInteger(T1) || T1 <= 0) throw new Error('taps1 must be a positive integer');
    if (!Number.isInteger(M1) || M1 <= 0) throw new Error('minutes1 must be a positive integer');
    if (!Number.isInteger(T2) || T2 <= 0) throw new Error('taps2 must be a positive integer');

    const M2 = (T1 * M1) / T2;
    if (M2 !== Math.floor(M2) || M2 <= 0) throw new Error('Result time is not a positive integer');

    return {
        questionData: {
            glasses: G,
            taps1: T1,
            minutes1: M1,
            taps2: T2
        },
        answer: Math.floor(M2)
    };
}

function validate(questionData, answer) {
    const { taps1, minutes1, taps2 } = questionData;
    if (!taps1 || !minutes1 || !taps2) return false;

    const expected = (taps1 * minutes1) / taps2;
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
    const { glasses, taps1, minutes1, taps2 } = questionData;
    return `To fill ${glasses} glasses of water, ${taps1} taps take ${minutes1} minutes.\nThen with ${taps2} taps, how much time is needed to fill ${glasses} glasses?`;
}

module.exports = {
    id:                   'wt_find_time',
    name:                 'Work & Time — Find Time',
    description:          'Given glasses, taps, and time for one scenario, find the time needed with a different number of taps. (Easy)',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'work and time',
    tags:                 ["work","time","rate"],
    gradeLevel:           '5-7',
    answerType:           'numeric'
};
