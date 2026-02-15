// ============================================================================
// SCHOOL → RULE MAP
// ============================================================================
//
// Declarative mapping that connects every school to its concepts, and every
// concept slot to a specific rule id + difficulty key from the rule engine.
//
// This is the SINGLE SOURCE OF TRUTH for:
//   - Which concepts each school offers
//   - Which rules power each concept slot
//   - What difficulty key to pass to generateForDifficulty()
//   - The exact slot structure of a test paper (replaces paperBlueprint)
//   - The dropdown structure (replaces schoolConfig.concepts)
//
// To add a new school, concept, or difficulty slot — edit ONLY this file.
//
// ============================================================================

// ----------------------------------------------------------------------------
// School labels (for UI display)
// ----------------------------------------------------------------------------

const schoolLabels = {
    SOP: 'School of Programming (SOP)',
    SOB: 'School of Business (SOB)',
    SOF: 'School of Finance (SOF)',
    BCA: 'BCA'
};

// ----------------------------------------------------------------------------
// The core mapping
// ----------------------------------------------------------------------------
//
// Structure:
//   schoolRuleMap[school][conceptKey] = [
//     { ruleId, difficulty, label },
//     ...
//   ]
//
// Each entry is one "slot" on the test paper.
//   ruleId      — matches a rule's `id` in the registry
//   difficulty  — the difficultyConfig key to pass to generateForDifficulty()
//   label       — human-readable label shown in dropdowns & progress grid
//

const schoolRuleMap = {

    // ========================================================================
    // SOP — School of Programming
    // ========================================================================
    SOP: {
        'number patterns': [
            { ruleId: 'constant_difference',    difficulty: 'easy',   label: 'Easy' },
            { ruleId: 'increasing_difference',  difficulty: 'medium', label: 'Medium 1' },
            { ruleId: 'perfect_squares',        difficulty: 'medium', label: 'Medium 2' },
            { ruleId: 'alternating_multiplier', difficulty: 'hard',   label: 'Hard' }
        ],
        'percentages': [
            { ruleId: 'pct_not_fresh',          difficulty: 'easy',   label: 'Easy' },
            { ruleId: 'pct_after_addition',     difficulty: 'medium', label: 'Medium' },
            { ruleId: 'pct_reverse_find_count', difficulty: 'hard',   label: 'Hard' }
        ],
        'work and time': [
            { ruleId: 'wt_find_time',               difficulty: 'easy',   label: 'Easy' },
            { ruleId: 'wt_find_taps',                difficulty: 'medium', label: 'Medium' },
            { ruleId: 'wt_different_glasses_taps',   difficulty: 'hard',   label: 'Hard' }
        ],
        'linear equations in two variables': [
            { ruleId: 'le_bus_capacity',       difficulty: 'easy',   label: 'Easy 1' },
            { ruleId: 'le_box_capacity',       difficulty: 'easy',   label: 'Easy 2' },
            { ruleId: 'le_cashier_notes',      difficulty: 'medium', label: 'Medium 1' },
            { ruleId: 'le_notebook_pen_combo', difficulty: 'medium', label: 'Medium 2' },
            { ruleId: 'le_notes_with_ratio',   difficulty: 'hard',   label: 'Hard 1' },
            { ruleId: 'le_weight_with_ratio',  difficulty: 'hard',   label: 'Hard 2' }
        ]
    },

    // ========================================================================
    // SOB — School of Business
    // ========================================================================
    SOB: {
        'number patterns': [
            { ruleId: 'constant_difference',    difficulty: 'easy',   label: 'Easy' },
            { ruleId: 'increasing_difference',  difficulty: 'medium', label: 'Medium 1' },
            { ruleId: 'perfect_squares',        difficulty: 'medium', label: 'Medium 2' },
            { ruleId: 'alternating_multiplier', difficulty: 'hard',   label: 'Hard' }
        ],
        'percentages': [
            { ruleId: 'pct_part_of_whole',       difficulty: 'easy',   label: 'Easy' },
            { ruleId: 'pct_discount_tax_amount', difficulty: 'medium', label: 'Medium 1' },
            { ruleId: 'pct_marks_percentage',    difficulty: 'medium', label: 'Medium 2' },
            { ruleId: 'pct_population_change',   difficulty: 'hard',   label: 'Hard' }
        ],
        'profit and loss': [
            { ruleId: 'pl_simple_cp_sp',      difficulty: 'easy',   label: 'Easy' },
            { ruleId: 'pl_target_profit_sp',  difficulty: 'medium', label: 'Medium 1' },
            { ruleId: 'pl_bulk_buy',          difficulty: 'medium', label: 'Medium 2' },
            { ruleId: 'pl_split_selling',     difficulty: 'hard',   label: 'Hard' }
        ],
        'simple interest': [
            { ruleId: 'si_find_interest',  difficulty: 'easy',   label: 'Easy' },
            { ruleId: 'si_find_principal', difficulty: 'medium', label: 'Medium 1' },
            { ruleId: 'si_find_amount',    difficulty: 'medium', label: 'Medium 2' },
            { ruleId: 'si_find_rate',      difficulty: 'hard',   label: 'Hard' }
        ]
    },

    // ========================================================================
    // SOF — School of Finance  (same rules as SOB)
    // ========================================================================
    SOF: {
        'number patterns': [
            { ruleId: 'constant_difference',    difficulty: 'easy',   label: 'Easy' },
            { ruleId: 'increasing_difference',  difficulty: 'medium', label: 'Medium 1' },
            { ruleId: 'perfect_squares',        difficulty: 'medium', label: 'Medium 2' },
            { ruleId: 'alternating_multiplier', difficulty: 'hard',   label: 'Hard' }
        ],
        'percentages': [
            { ruleId: 'pct_part_of_whole',       difficulty: 'easy',   label: 'Easy' },
            { ruleId: 'pct_discount_tax_amount', difficulty: 'medium', label: 'Medium 1' },
            { ruleId: 'pct_marks_percentage',    difficulty: 'medium', label: 'Medium 2' },
            { ruleId: 'pct_population_change',   difficulty: 'hard',   label: 'Hard' }
        ],
        'profit and loss': [
            { ruleId: 'pl_simple_cp_sp',      difficulty: 'easy',   label: 'Easy' },
            { ruleId: 'pl_target_profit_sp',  difficulty: 'medium', label: 'Medium 1' },
            { ruleId: 'pl_bulk_buy',          difficulty: 'medium', label: 'Medium 2' },
            { ruleId: 'pl_split_selling',     difficulty: 'hard',   label: 'Hard' }
        ],
        'simple interest': [
            { ruleId: 'si_find_interest',  difficulty: 'easy',   label: 'Easy' },
            { ruleId: 'si_find_principal', difficulty: 'medium', label: 'Medium 1' },
            { ruleId: 'si_find_amount',    difficulty: 'medium', label: 'Medium 2' },
            { ruleId: 'si_find_rate',      difficulty: 'hard',   label: 'Hard' }
        ]
    },

    // ========================================================================
    // BCA  (same rules as SOP)
    // ========================================================================
    BCA: {
        'number patterns': [
            { ruleId: 'constant_difference',    difficulty: 'easy',   label: 'Easy' },
            { ruleId: 'increasing_difference',  difficulty: 'medium', label: 'Medium 1' },
            { ruleId: 'perfect_squares',        difficulty: 'medium', label: 'Medium 2' },
            { ruleId: 'alternating_multiplier', difficulty: 'hard',   label: 'Hard' }
        ],
        'percentages': [
            { ruleId: 'pct_not_fresh',          difficulty: 'easy',   label: 'Easy' },
            { ruleId: 'pct_after_addition',     difficulty: 'medium', label: 'Medium' },
            { ruleId: 'pct_reverse_find_count', difficulty: 'hard',   label: 'Hard' }
        ],
        'work and time': [
            { ruleId: 'wt_find_time',               difficulty: 'easy',   label: 'Easy' },
            { ruleId: 'wt_find_taps',                difficulty: 'medium', label: 'Medium' },
            { ruleId: 'wt_different_glasses_taps',   difficulty: 'hard',   label: 'Hard' }
        ],
        'linear equations in two variables': [
            { ruleId: 'le_bus_capacity',       difficulty: 'easy',   label: 'Easy 1' },
            { ruleId: 'le_box_capacity',       difficulty: 'easy',   label: 'Easy 2' },
            { ruleId: 'le_cashier_notes',      difficulty: 'medium', label: 'Medium 1' },
            { ruleId: 'le_notebook_pen_combo', difficulty: 'medium', label: 'Medium 2' },
            { ruleId: 'le_notes_with_ratio',   difficulty: 'hard',   label: 'Hard 1' },
            { ruleId: 'le_weight_with_ratio',  difficulty: 'hard',   label: 'Hard 2' }
        ]
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a flat array of all slots for a school — replaces paperBlueprint[school].
 *
 * @param {string} school — 'SOP', 'SOB', 'SOF', or 'BCA'
 * @returns {Array<{ concept, ruleId, difficulty, label }>}  or null if unknown school.
 */
function getSlots(school) {
    const concepts = schoolRuleMap[school];
    if (!concepts) return null;

    const slots = [];
    Object.keys(concepts).forEach(conceptKey => {
        concepts[conceptKey].forEach(slot => {
            slots.push({
                concept:    conceptKey,
                ruleId:     slot.ruleId,
                difficulty: slot.difficulty,
                label:      slot.label
            });
        });
    });
    return slots;
}

/**
 * Get concept config for a school — replaces schoolConfig[school].concepts
 * for dropdown population.
 *
 * Returns an object:
 *   {
 *     'number patterns': {
 *       label: 'Number Patterns',
 *       slots: [ { ruleId, difficulty, label }, ... ]
 *     },
 *     ...
 *   }
 *
 * @param {string} school
 * @returns {Object|null}
 */
const conceptDisplayLabels = {
    'number patterns':                       'Number Patterns',
    'percentages':                           'Percentages',
    'work and time':                         'Work and Time',
    'linear equations in two variables':     'Linear Equations in Two Variables',
    'profit and loss':                       'Profit and Loss',
    'simple interest':                       'Simple Interest'
};

function getConceptConfig(school) {
    const concepts = schoolRuleMap[school];
    if (!concepts) return null;

    const config = {};
    Object.keys(concepts).forEach(conceptKey => {
        config[conceptKey] = {
            label: conceptDisplayLabels[conceptKey] || conceptKey,
            slots: concepts[conceptKey]
        };
    });
    return config;
}

/**
 * List all schools that are mapped.
 * @returns {string[]}
 */
function listSchools() {
    return Object.keys(schoolRuleMap);
}

// ============================================================================
// MODULE EXPORT
// ============================================================================

module.exports = {
    schoolRuleMap,
    schoolLabels,
    conceptDisplayLabels,
    getSlots,
    getConceptConfig,
    listSchools
};
