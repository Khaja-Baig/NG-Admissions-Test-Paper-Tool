// ============================================================================
// STRUCTURED LOGGER (Winston)
// ============================================================================
// Usage:
//   const logger = require('./logger');
//   logger.info('Server started', { port: 3000 });
//   logger.warn('Slow request', { path: '/api/foo', ms: 1200 });
//   logger.error('Unhandled', { err: error.message, stack: error.stack });
// ============================================================================

const { createLogger, format, transports } = require('winston');
const path = require('path');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV  = process.env.NODE_ENV || 'development';

// Log directory (sibling to server/)
const LOG_DIR = path.join(__dirname, '..', 'logs');

// --- Formats ----------------------------------------------------------------
const devFormat = format.combine(
    format.timestamp({ format: 'HH:mm:ss' }),
    format.colorize(),
    format.printf(({ timestamp, level, message, ...meta }) => {
        const extra = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
        return `${timestamp} ${level}: ${message}${extra}`;
    })
);

const prodFormat = format.combine(
    format.timestamp(),
    format.json()
);

// --- Logger -----------------------------------------------------------------
const logger = createLogger({
    level: LOG_LEVEL,
    format: NODE_ENV === 'production' ? prodFormat : devFormat,
    transports: [
        new transports.Console(),
    ]
});

// In production, also write to files
if (NODE_ENV === 'production') {
    const fs = require('fs');
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

    logger.add(new transports.File({
        filename: path.join(LOG_DIR, 'error.log'),
        level: 'error',
        maxsize: 5 * 1024 * 1024, // 5 MB
        maxFiles: 3
    }));
    logger.add(new transports.File({
        filename: path.join(LOG_DIR, 'combined.log'),
        maxsize: 10 * 1024 * 1024, // 10 MB
        maxFiles: 5
    }));
}

module.exports = logger;
