// server/firebase.js — Firebase Admin SDK initialization
// Supports two auth modes:
//   1. Local dev:  FIREBASE_SERVICE_ACCOUNT_PATH (path to JSON key file)
//   2. Production: FIREBASE_SERVICE_ACCOUNT_JSON (full JSON string, for Render env vars)

const admin = require('firebase-admin');
const logger = require('./logger');

function initFirebase() {
  // Already initialized?
  if (admin.apps.length) {
    return admin.firestore();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!projectId) {
    logger.warn('FIREBASE_PROJECT_ID not set — Firestore disabled, using JSON fallback');
    return null;
  }

  try {
    let credential;

    logger.info('Firebase env check: PROJECT_ID=%s, HAS_JSON=%s, HAS_PATH=%s',
      projectId ? 'yes' : 'no',
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? `yes(${process.env.FIREBASE_SERVICE_ACCOUNT_JSON.length}chars)` : 'no',
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ? 'yes' : 'no'
    );

    // Option 1: Full JSON string (for Render / production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      credential = admin.credential.cert(serviceAccount);
      logger.info('Firebase: using service account from env JSON');
    }
    // Option 2: File path (for local dev)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const path = require('path');
      const keyPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      const serviceAccount = require(keyPath);
      credential = admin.credential.cert(serviceAccount);
      logger.info('Firebase: using service account from file: %s', keyPath);
    }
    else {
      logger.warn('No Firebase credentials found — Firestore disabled, using JSON fallback');
      return null;
    }

    admin.initializeApp({
      credential,
      projectId,
    });

    const db = admin.firestore();
    logger.info('✅ Firestore connected — project: %s', projectId);
    return db;
  } catch (err) {
    logger.error('Firebase init failed: %s — falling back to JSON', err.message);
    return null;
  }
}

const db = initFirebase();

module.exports = { db, admin };
