// ============================================================================
// SCHOOL → RULE MAP  (thin loader over data/schoolConfigs.json)
// ============================================================================
//
// All declarative data now lives in  data/schoolConfigs.json.
// This module loads it and exposes the same API as before:
//   schoolRuleMap, schoolLabels, conceptDisplayLabels,
//   getSlots(), getConceptConfig(), listSchools()
//
// To add a new school, concept, or difficulty slot — edit the JSON file.
//
// ============================================================================

const configData = require('../data/schoolConfigs.json');

const schoolRuleMap        = configData.schoolRuleMap;
const schoolLabels         = configData.schoolLabels;
const conceptDisplayLabels = configData.conceptDisplayLabels;

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
