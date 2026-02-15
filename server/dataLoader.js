// ============================================================================
// DATA LOADER — Firestore-first with JSON fallback
// ============================================================================
//
// This module loads school configs and display config from Firestore.
// If Firestore is unavailable, it falls back to the local JSON files.
//
// Data is cached in memory for fast access. Call refreshCache() to reload.
//
// Usage:
//   const dataLoader = require('./dataLoader');
//   await dataLoader.init();                    // call once at startup
//   const schools = dataLoader.listSchools();   // sync, from cache
//   await dataLoader.refreshCache();            // force reload from Firestore
//
// ============================================================================

const { db } = require('./firebase');
const logger = require('./logger');

// JSON fallback files
const schoolConfigsJSON = require('../data/schoolConfigs.json');
const displayConfigJSON = require('../data/displayConfig.json');

// ── In-memory cache ─────────────────────────────────────────────────────────

let cache = {
    // School data
    schoolRuleMap: {},         // { SOP: { 'number patterns': [...], ... }, ... }
    schoolLabels: {},          // { SOP: 'School of Programming (SOP)', ... }
    schoolFullNames: {},       // { SOP: 'School Of Programming', ... }
    conceptDisplayLabels: {},  // { 'number patterns': 'Number Patterns', ... }

    // Display config
    conceptExplanations: {},   // { 'percentages': [...], ... }
    conceptDisplayTitles: {},  // { 'number patterns': 'Number Patterns', ... }

    // Meta
    source: 'none',            // 'firestore' or 'json'
    lastRefresh: null
};

// ── Load from Firestore ─────────────────────────────────────────────────────

async function loadFromFirestore() {
    if (!db) return false;

    try {
        // Load all school documents
        const schoolsSnapshot = await db.collection('schools').get();

        if (schoolsSnapshot.empty) {
            logger.warn('Firestore: schools collection is empty');
            return false;
        }

        const schoolRuleMap = {};
        const schoolLabels = {};
        const schoolFullNames = {};
        const conceptDisplayLabels = {};

        schoolsSnapshot.forEach(doc => {
            const schoolId = doc.id;
            const data = doc.data();

            schoolLabels[schoolId] = data.label || schoolId;
            schoolFullNames[schoolId] = data.fullName || data.label || schoolId;

            // Rebuild schoolRuleMap from concepts
            schoolRuleMap[schoolId] = {};
            if (data.concepts) {
                for (const [conceptKey, conceptData] of Object.entries(data.concepts)) {
                    schoolRuleMap[schoolId][conceptKey] = conceptData.slots || [];

                    // Collect concept display labels
                    if (conceptData.displayLabel) {
                        conceptDisplayLabels[conceptKey] = conceptData.displayLabel;
                    }
                }
            }
        });

        // Load display config
        const displayDoc = await db.collection('displayConfig').doc('main').get();
        let conceptExplanations = {};
        let conceptDisplayTitles = {};

        if (displayDoc.exists) {
            const displayData = displayDoc.data();
            conceptExplanations = displayData.conceptExplanations || {};
            conceptDisplayTitles = displayData.conceptDisplayTitles || {};

            // schoolFullNames from display config (may override school doc values)
            if (displayData.schoolFullNames) {
                Object.assign(schoolFullNames, displayData.schoolFullNames);
            }
        }

        // Load concept labels doc (fallback for any missing labels)
        const labelsDoc = await db.collection('displayConfig').doc('conceptLabels').get();
        if (labelsDoc.exists) {
            const labelsData = labelsDoc.data();
            if (labelsData.labels) {
                // Don't override already-loaded labels
                for (const [key, val] of Object.entries(labelsData.labels)) {
                    if (!conceptDisplayLabels[key]) {
                        conceptDisplayLabels[key] = val;
                    }
                }
            }
        }

        // Update cache
        cache = {
            schoolRuleMap,
            schoolLabels,
            schoolFullNames,
            conceptDisplayLabels,
            conceptExplanations,
            conceptDisplayTitles,
            source: 'firestore',
            lastRefresh: new Date().toISOString()
        };

        logger.info('Data loaded from Firestore — %d schools, %d concepts',
            Object.keys(schoolRuleMap).length,
            Object.keys(conceptDisplayLabels).length
        );

        return true;
    } catch (err) {
        logger.error('Failed to load from Firestore: %s', err.message);
        return false;
    }
}

// ── Load from JSON (fallback) ───────────────────────────────────────────────

function loadFromJSON() {
    cache = {
        schoolRuleMap: schoolConfigsJSON.schoolRuleMap,
        schoolLabels: schoolConfigsJSON.schoolLabels,
        schoolFullNames: displayConfigJSON.schoolFullNames || {},
        conceptDisplayLabels: schoolConfigsJSON.conceptDisplayLabels,
        conceptExplanations: displayConfigJSON.conceptExplanations || {},
        conceptDisplayTitles: displayConfigJSON.conceptDisplayTitles || {},
        source: 'json',
        lastRefresh: new Date().toISOString()
    };

    logger.info('Data loaded from JSON fallback — %d schools',
        Object.keys(cache.schoolRuleMap).length
    );
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Initialize the data layer. Call once at server startup.
 * Tries Firestore first, falls back to JSON.
 */
async function init() {
    const ok = await loadFromFirestore();
    if (!ok) {
        loadFromJSON();
    }
}

/**
 * Force reload from Firestore (or JSON if Firestore unavailable).
 */
async function refreshCache() {
    const ok = await loadFromFirestore();
    if (!ok) {
        loadFromJSON();
    }
    return cache.source;
}

// ── Accessors (sync, read from cache) ───────────────────────────────────────

function getSchoolRuleMap() { return cache.schoolRuleMap; }
function getSchoolLabels() { return cache.schoolLabels; }
function getSchoolFullNames() { return cache.schoolFullNames; }
function getConceptDisplayLabels() { return cache.conceptDisplayLabels; }
function getConceptExplanations() { return cache.conceptExplanations; }
function getConceptDisplayTitles() { return cache.conceptDisplayTitles; }

function listSchools() {
    return Object.keys(cache.schoolRuleMap);
}

function getSlots(school) {
    const s = school.trim().toUpperCase();
    const concepts = cache.schoolRuleMap[s];
    if (!concepts) return null;

    const slots = [];
    Object.keys(concepts).forEach(conceptKey => {
        concepts[conceptKey].forEach(slot => {
            slots.push({
                concept: conceptKey,
                ruleId: slot.ruleId,
                difficulty: slot.difficulty,
                label: slot.label
            });
        });
    });
    return slots;
}

function getConceptConfig(school) {
    const s = school.trim().toUpperCase();
    const concepts = cache.schoolRuleMap[s];
    if (!concepts) return null;

    const config = {};
    Object.keys(concepts).forEach(conceptKey => {
        config[conceptKey] = {
            label: cache.conceptDisplayLabels[conceptKey] || conceptKey,
            slots: concepts[conceptKey]
        };
    });
    return config;
}

function getDataSource() {
    return {
        source: cache.source,
        lastRefresh: cache.lastRefresh,
        schools: Object.keys(cache.schoolRuleMap).length,
        concepts: Object.keys(cache.conceptDisplayLabels).length
    };
}

// ── Firestore write helpers (for CRUD endpoints) ────────────────────────────

/**
 * Save a school document to Firestore + update cache.
 */
async function saveSchool(schoolId, data) {
    if (!db) throw new Error('Firestore not available');

    const doc = {
        label: data.label || schoolId,
        fullName: data.fullName || data.label || schoolId,
        concepts: data.concepts || {}
    };

    await db.collection('schools').doc(schoolId).set(doc);

    // Update cache
    cache.schoolLabels[schoolId] = doc.label;
    cache.schoolFullNames[schoolId] = doc.fullName;
    cache.schoolRuleMap[schoolId] = {};

    for (const [conceptKey, conceptData] of Object.entries(doc.concepts)) {
        cache.schoolRuleMap[schoolId][conceptKey] = conceptData.slots || [];
        if (conceptData.displayLabel) {
            cache.conceptDisplayLabels[conceptKey] = conceptData.displayLabel;
        }
    }

    // Also update schoolFullNames in displayConfig
    await db.collection('displayConfig').doc('main').set(
        { schoolFullNames: cache.schoolFullNames },
        { merge: true }
    );

    logger.info('School saved: %s', schoolId);
    return doc;
}

/**
 * Delete a school from Firestore + update cache.
 */
async function deleteSchool(schoolId) {
    if (!db) throw new Error('Firestore not available');

    await db.collection('schools').doc(schoolId).delete();

    delete cache.schoolRuleMap[schoolId];
    delete cache.schoolLabels[schoolId];
    delete cache.schoolFullNames[schoolId];

    // Also update schoolFullNames in displayConfig
    await db.collection('displayConfig').doc('main').set(
        { schoolFullNames: cache.schoolFullNames },
        { merge: true }
    );

    logger.info('School deleted: %s', schoolId);
}

/**
 * Save display config to Firestore + update cache.
 */
async function saveDisplayConfig(data) {
    if (!db) throw new Error('Firestore not available');

    const doc = {
        conceptExplanations: data.conceptExplanations || cache.conceptExplanations,
        conceptDisplayTitles: data.conceptDisplayTitles || cache.conceptDisplayTitles,
        schoolFullNames: data.schoolFullNames || cache.schoolFullNames
    };

    await db.collection('displayConfig').doc('main').set(doc);

    cache.conceptExplanations = doc.conceptExplanations;
    cache.conceptDisplayTitles = doc.conceptDisplayTitles;
    cache.schoolFullNames = doc.schoolFullNames;

    logger.info('Display config saved');
    return doc;
}

/**
 * Save concept labels to Firestore + update cache.
 */
async function saveConceptLabels(labels) {
    if (!db) throw new Error('Firestore not available');

    await db.collection('displayConfig').doc('conceptLabels').set({ labels });
    Object.assign(cache.conceptDisplayLabels, labels);

    logger.info('Concept labels saved: %d labels', Object.keys(labels).length);
}

module.exports = {
    init,
    refreshCache,
    getDataSource,

    // Accessors (sync, cached)
    listSchools,
    getSlots,
    getConceptConfig,
    getSchoolRuleMap,
    getSchoolLabels,
    getSchoolFullNames,
    getConceptDisplayLabels,
    getConceptExplanations,
    getConceptDisplayTitles,

    // Write helpers (async, Firestore)
    saveSchool,
    deleteSchool,
    saveDisplayConfig,
    saveConceptLabels
};
