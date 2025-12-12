/**
 * Logger Utility
 * Simple logging functions for server
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const getTimestamp = () => {
  return new Date().toISOString();
};

export const logInfo = (message) => {
  console.log(`${colors.cyan}[INFO]${colors.reset} ${colors.bright}${getTimestamp()}${colors.reset} - ${message}`);
};

export const logError = (message, error = null) => {
  console.error(`${colors.red}[ERROR]${colors.reset} ${colors.bright}${getTimestamp()}${colors.reset} - ${message}`);
  if (error) {
    console.error(error);
  }
};

export const logWarning = (message) => {
  console.warn(`${colors.yellow}[WARN]${colors.reset} ${colors.bright}${getTimestamp()}${colors.reset} - ${message}`);
};

export const logSuccess = (message) => {
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${colors.bright}${getTimestamp()}${colors.reset} - ${message}`);
};
