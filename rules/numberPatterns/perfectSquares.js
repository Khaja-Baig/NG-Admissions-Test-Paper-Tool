// ============================================================================
// RULE: Perfect Squares Pattern
// ============================================================================
//
// Generates a pattern of consecutive perfect squares.
//
// Mathematical basis:
//   Given: starting base n
//   Sequence: n², (n+1)², (n+2)², (n+3)², (n+4)²
//   Answer: (n+4)²
//
// ============================================================================

const { randomInt } = require('../utils');

const difficultyConfig = {
    medium: {
        base: { min: 2, max: 8 }
    }
};

function generate(params) {
    const cfg = difficultyConfig.medium;
    const n = (params && params.base != null) ? params.base : randomInt(cfg.base.min, cfg.base.max);

    if (!Number.isInteger(n)) throw new Error('base must be an integer');
    if (n < 1) throw new Error('base must be at least 1');

    const seq = [n * n, (n + 1) * (n + 1), (n + 2) * (n + 2), (n + 3) * (n + 3)];
    const answer = (n + 4) * (n + 4);

    return {
        questionData: {
            sequence: seq,
            startBase: n
        },
        answer: answer
    };
}

function validate(questionData, answer) {
    const seq = questionData.sequence;
    if (!Array.isArray(seq) || seq.length < 3) return false;

    // Check that each term is a perfect square and bases are consecutive
    const bases = seq.map(v => Math.round(Math.sqrt(v)));
    for (let i = 0; i < bases.length; i++) {
        if (bases[i] * bases[i] !== seq[i]) return false;
    }
    for (let i = 1; i < bases.length; i++) {
        if (bases[i] - bases[i - 1] !== 1) return false;
    }

    const nextBase = bases[bases.length - 1] + 1;
    return answer === nextBase * nextBase;
}

function generateForDifficulty(difficultyKey) {
    const cfg = difficultyConfig[difficultyKey];
    if (!cfg) {
        throw new Error(`Unknown difficulty: "${difficultyKey}". Valid: ${Object.keys(difficultyConfig).join(', ')}`);
    }
    return generate({
        base: randomInt(cfg.base.min, cfg.base.max)
    });
}

function formatQuestion(questionData) {
    const sequence = questionData.sequence.join(', ') + ', ___';
    return `What will be the next term in the pattern?\n${sequence}`;
}

module.exports = {
    id:                   'perfect_squares',
    name:                 'Perfect Squares Pattern',
    description:          'Generates a pattern of consecutive perfect squares (n², (n+1)², ...). The student must find the next term.',
    generate:             generate,
    validate:             validate,
    formatQuestion:       formatQuestion,
    difficultyConfig:     difficultyConfig,
    generateForDifficulty: generateForDifficulty,

    // --- Metadata (SaaS / search / filter) ---
    concept:              'number patterns',
    tags:                 ["squares","sequence","pattern"],
    gradeLevel:           '5-7',
    answerType:           'numeric'
};
