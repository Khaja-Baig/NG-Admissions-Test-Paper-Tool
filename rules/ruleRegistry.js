// ============================================================================
// RULE REGISTRY
// ============================================================================
//
// Central registry for all question-generation rules.
//
// To add a new rule:
//   1. Create a new file in /rules/<concept>/ (e.g., rules/percentages/myRule.js)
//   2. Make sure it exports the Rule Interface (see ruleInterface.js)
//   3. Import it below and add it to the `rules` object
//
// That's it. The rest of the platform picks it up automatically.
//
// ============================================================================

// --- Number Patterns ---
const constantDifference    = require('./constantDifference');
const increasingDifference  = require('./numberPatterns/increasingDifference');
const perfectSquares        = require('./numberPatterns/perfectSquares');
const alternatingMultiplier = require('./numberPatterns/alternatingMultiplier');

// --- Percentages (SOP / BCA) ---
const pctNotFresh           = require('./percentages/pctNotFresh');
const pctAfterAddition      = require('./percentages/pctAfterAddition');
const pctReverseFindCount   = require('./percentages/pctReverseFindCount');

// --- Percentages (SOB / SOF) ---
const pctPartOfWhole        = require('./percentages/pctPartOfWhole');
const pctDiscountTaxAmount  = require('./percentages/pctDiscountTaxAmount');
const pctMarksPercentage    = require('./percentages/pctMarksPercentage');
const pctPopulationChange   = require('./percentages/pctPopulationChange');

// --- Work & Time ---
const wtFindTime            = require('./workTime/wtFindTime');
const wtFindTaps            = require('./workTime/wtFindTaps');
const wtDiffGlassesTaps     = require('./workTime/wtDifferentGlassesTaps');

// --- Profit & Loss ---
const plSimpleCpSp          = require('./profitLoss/plSimpleCpSp');
const plTargetProfitSp      = require('./profitLoss/plTargetProfitSp');
const plBulkBuy             = require('./profitLoss/plBulkBuy');
const plSplitSelling        = require('./profitLoss/plSplitSelling');

// --- Simple Interest ---
const siFindInterest        = require('./simpleInterest/siFindInterest');
const siFindPrincipal       = require('./simpleInterest/siFindPrincipal');
const siFindAmount          = require('./simpleInterest/siFindAmount');
const siFindRate            = require('./simpleInterest/siFindRate');

// --- Linear Equations ---
const leBusCapacity         = require('./linearEquations/leBusCapacity');
const leBoxCapacity         = require('./linearEquations/leBoxCapacity');
const leCashierNotes        = require('./linearEquations/leCashierNotes');
const leNotebookPenCombo    = require('./linearEquations/leNotebookPenCombo');
const leNotesWithRatio      = require('./linearEquations/leNotesWithRatio');
const leWeightWithRatio     = require('./linearEquations/leWeightWithRatio');

// --- Internal rule store ---
// Keyed by rule id for O(1) lookup.
const rules = {};

const allRules = [
    constantDifference,
    increasingDifference,
    perfectSquares,
    alternatingMultiplier,
    pctNotFresh,
    pctAfterAddition,
    pctReverseFindCount,
    pctPartOfWhole,
    pctDiscountTaxAmount,
    pctMarksPercentage,
    pctPopulationChange,
    wtFindTime,
    wtFindTaps,
    wtDiffGlassesTaps,
    plSimpleCpSp,
    plTargetProfitSp,
    plBulkBuy,
    plSplitSelling,
    siFindInterest,
    siFindPrincipal,
    siFindAmount,
    siFindRate,
    leBusCapacity,
    leBoxCapacity,
    leCashierNotes,
    leNotebookPenCombo,
    leNotesWithRatio,
    leWeightWithRatio
];

allRules.forEach(r => { rules[r.id] = r; });

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get a single rule by its id.
 *
 * @param  {string} ruleId — The rule's unique identifier (e.g. 'constant_difference')
 * @returns {Object|null}   — The rule object, or null if not found.
 */
function getRule(ruleId) {
    return rules[ruleId] || null;
}

/**
 * List all registered rules.
 *
 * @returns {Object[]} — Array of rule objects, each conforming to the Rule Interface.
 */
function listRules() {
    return Object.values(rules);
}

/**
 * List all registered rule ids.
 *
 * @returns {string[]} — Array of rule id strings.
 */
function listRuleIds() {
    return Object.keys(rules);
}

// --- Export ---
module.exports = {
    getRule,
    listRules,
    listRuleIds
};
