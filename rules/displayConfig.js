// ============================================================================
// DISPLAY CONFIGURATION  (thin loader over data/displayConfig.json)
// ============================================================================
//
// All static display data now lives in  data/displayConfig.json.
// This module loads it and re-exports the same three objects:
//   conceptExplanations, conceptDisplayTitles, schoolFullNames
//
// To update PDF text, concept titles, or school names — edit the JSON file.
//
// ============================================================================

const configData = require('../data/displayConfig.json');

module.exports = {
    conceptExplanations:  configData.conceptExplanations,
    conceptDisplayTitles: configData.conceptDisplayTitles,
    schoolFullNames:      configData.schoolFullNames
};
