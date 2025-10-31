// backend/src/utils/logger.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, '../../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  constructor() {
    this.logFile = path.join(LOG_DIR, `app-${this.getDateString()}.log`);
    this.errorFile = path.join(LOG_DIR, `error-${this.getDateString()}.log`);
  }

  getDateString() {
    return new Date().toISOString().split('T')[0];
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, meta = {}) {
    const logEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      ...meta
    };
    return JSON.stringify(logEntry);
  }

  writeToFile(file, message) {
    fs.appendFileSync(file, message + '\n', 'utf8');
  }

  log(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output with colors
    const colors = {
      ERROR: '\x1b[31m',
      WARN: '\x1b[33m',
      INFO: '\x1b[36m',
      DEBUG: '\x1b[90m'
    };
    const reset = '\x1b[0m';
    
    console.log(`${colors[level]}[${level}]${reset} ${message}`, meta);
    
    // File output
    this.writeToFile(this.logFile, formattedMessage);
    
    if (level === LOG_LEVELS.ERROR) {
      this.writeToFile(this.errorFile, formattedMessage);
    }
  }

  error(message, meta = {}) {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV !== 'production') {
      this.log(LOG_LEVELS.DEBUG, message, meta);
    }
  }
}

export default new Logger();

// Usage in your routes:
// import logger from '../utils/logger.js';
// logger.info('User selected district', { districtCode: 'raipur' });
// logger.error('API fetch failed', { error: err.message });