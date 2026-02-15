#!/usr/bin/env node
// ============================================================================
// SEED FIRESTORE — Migrate JSON config files → Firestore collections
// ============================================================================
//
// Usage:  node scripts/seedFirestore.js
//
// Reads:  data/schoolConfigs.json, data/displayConfig.json
// Writes: Firestore collections:
//
//   schools/{SOP}          — { label, concepts: { ... } }
//   schools/{SOB}          — ...
//   displayConfig/main     — { conceptExplanations, conceptDisplayTitles, schoolFullNames }
//
// Safe to re-run — it overwrites existing documents (set with merge).
// ============================================================================

require('dotenv').config();

const path = require('path');
const { db } = require('../server/firebase');

const schoolConfigs = require('../data/schoolConfigs.json');
const displayConfigData = require('../data/displayConfig.json');

async function seed() {
    if (!db) {
        console.error('❌ Firestore not initialized — check .env for Firebase config');
        process.exit(1);
    }

    console.log('🔥 Seeding Firestore...\n');

    // ── 1. Schools collection ───────────────────────────────────────────────
    // Each school becomes a document: schools/{SCHOOL_ID}
    // Contains: label, conceptDisplayLabels (shared), and its concept→slot mapping

    const schools = Object.keys(schoolConfigs.schoolRuleMap);
    let schoolCount = 0;

    for (const schoolId of schools) {
        const doc = {
            label: schoolConfigs.schoolLabels[schoolId] || schoolId,
            fullName: displayConfigData.schoolFullNames[schoolId] || schoolId,
            concepts: {}
        };

        // Build concepts map for this school
        const concepts = schoolConfigs.schoolRuleMap[schoolId];
        for (const conceptKey of Object.keys(concepts)) {
            doc.concepts[conceptKey] = {
                displayLabel: schoolConfigs.conceptDisplayLabels[conceptKey] || conceptKey,
                slots: concepts[conceptKey]  // array of { ruleId, difficulty, label }
            };
        }

        await db.collection('schools').doc(schoolId).set(doc);
        console.log(`  ✅ schools/${schoolId} — ${Object.keys(doc.concepts).length} concepts, label: "${doc.label}"`);
        schoolCount++;
    }

    console.log(`\n  📦 ${schoolCount} schools written\n`);

    // ── 2. Display config ───────────────────────────────────────────────────
    // Single document: displayConfig/main

    await db.collection('displayConfig').doc('main').set({
        conceptExplanations: displayConfigData.conceptExplanations,
        conceptDisplayTitles: displayConfigData.conceptDisplayTitles,
        schoolFullNames: displayConfigData.schoolFullNames
    });

    console.log(`  ✅ displayConfig/main — explanations, titles, full names`);

    // ── 3. Concept labels (shared reference) ────────────────────────────────
    // Single document: displayConfig/conceptLabels

    await db.collection('displayConfig').doc('conceptLabels').set({
        labels: schoolConfigs.conceptDisplayLabels
    });

    console.log(`  ✅ displayConfig/conceptLabels — ${Object.keys(schoolConfigs.conceptDisplayLabels).length} concept labels`);

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log('\n🎉 Firestore seed complete!');
    console.log(`   ${schoolCount} schools  |  1 displayConfig  |  1 conceptLabels`);
    console.log('\n   Verify at: https://console.firebase.google.com/project/exam-paper-generator-44a6e/firestore');
}

seed()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    });
