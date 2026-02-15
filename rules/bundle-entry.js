// ============================================================================
// BROWSER BUNDLE ENTRY POINT
// ============================================================================
//
// This file is the entry point for esbuild. It bundles the entire rule engine
// (all 28 rules + registry + schoolRuleMap + shared utils + MCQ helpers) into
// a single browser-ready IIFE that exposes everything on window.RuleEngine.
//
// Build command:
//   npx esbuild rules/bundle-entry.js --bundle --outfile=rules-bundle.js --format=iife --global-name=RuleEngine
//
// ============================================================================

const { getRule, listRules, listRuleIds } = require('./ruleRegistry');
const { schoolRuleMap, schoolLabels, getSlots, getConceptConfig, listSchools } = require('./schoolRuleMap');
const utils = require('./utils');
const mcqHelpers = require('./mcqHelpers');

module.exports = {
    getRule,
    listRules,
    listRuleIds,
    schoolRuleMap,
    schoolLabels,
    getSlots,
    getConceptConfig,
    listSchools,

    // Shared utilities (used by script.js for option generation, etc.)
    randomInt:              utils.randomInt,
    hasTrailingZeros:       utils.hasTrailingZeros,
    randomIntNoTrailing:    utils.randomIntNoTrailing,
    shuffle:                utils.shuffle,
    generateDistractors:    utils.generateDistractors,
    createOptions:          utils.createOptions,

    // MCQ helpers (string-based options for linear-equation MCQ rules)
    generateMCQOptions:     mcqHelpers.generateMCQOptions,
    shuffleOptionsWithAnswer: mcqHelpers.shuffleOptionsWithAnswer,
};
