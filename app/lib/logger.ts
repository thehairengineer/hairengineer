import fs from 'fs';
import path from 'path';

// Configure log settings
const LOG_TO_FILE = process.env.NODE_ENV === 'production'; // Set to true to log to file in production
const LOG_TO_CONSOLE = true; // Whether to log to console
const LOG_DIRECTORY = path.join(process.cwd(), 'logs');
const AUTH_LOG_FILE = path.join(LOG_DIRECTORY, 'auth.log');

// Initialize log directory if it doesn't exist
try {
  if (LOG_TO_FILE && !fs.existsSync(LOG_DIRECTORY)) {
    fs.mkdirSync(LOG_DIRECTORY, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create log directory:', error);
}

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  data?: any;
}

/**
 * Format log entry as a string
 */
function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, source, message, data } = entry;
  let logString = `[${timestamp}] [${level}] [${source}] ${message}`;
  
  if (data) {
    try {
      // Handle request and response objects specially to avoid circular references
      const sanitizedData = { ...data };
      if (sanitizedData.request) sanitizedData.request = '[Request Object]';
      if (sanitizedData.response) sanitizedData.response = '[Response Object]';
      if (sanitizedData.token) sanitizedData.token = '[TOKEN HIDDEN]';
      
      logString += ` | ${JSON.stringify(sanitizedData)}`;
    } catch (e) {
      logString += ` | [Data could not be stringified: ${e}]`;
    }
  }
  
  return logString;
}

/**
 * Log a message with optional data
 */
export function log(level: LogLevel, source: string, message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  const entry: LogEntry = { timestamp, level, source, message, data };
  const formattedEntry = formatLogEntry(entry);
  
  // Log to console if enabled
  if (LOG_TO_CONSOLE) {
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedEntry);
        break;
      case LogLevel.WARN:
        console.warn(formattedEntry);
        break;
      case LogLevel.INFO:
        console.info(formattedEntry);
        break;
      default:
        console.log(formattedEntry);
    }
  }
  
  // Log to file if enabled
  if (LOG_TO_FILE) {
    try {
      fs.appendFileSync(AUTH_LOG_FILE, formattedEntry + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
}

/**
 * Shorthand logging methods
 */
export const logger = {
  debug: (source: string, message: string, data?: any) => log(LogLevel.DEBUG, source, message, data),
  info: (source: string, message: string, data?: any) => log(LogLevel.INFO, source, message, data),
  warn: (source: string, message: string, data?: any) => log(LogLevel.WARN, source, message, data),
  error: (source: string, message: string, data?: any) => log(LogLevel.ERROR, source, message, data),
  
  // Specialized auth logger
  auth: {
    debug: (message: string, data?: any) => log(LogLevel.DEBUG, 'AUTH', message, data),
    info: (message: string, data?: any) => log(LogLevel.INFO, 'AUTH', message, data),
    warn: (message: string, data?: any) => log(LogLevel.WARN, 'AUTH', message, data),
    error: (message: string, data?: any) => log(LogLevel.ERROR, 'AUTH', message, data),
    
    // Specific auth events
    attempt: (username: string, ip?: string) => 
      log(LogLevel.INFO, 'AUTH', 'Login attempt', { username, ip, timestamp: new Date().toISOString() }),
    
    success: (username: string, ip?: string) => 
      log(LogLevel.INFO, 'AUTH', 'Login successful', { username, ip, timestamp: new Date().toISOString() }),
    
    failure: (username: string, reason: string, ip?: string) => 
      log(LogLevel.WARN, 'AUTH', 'Login failed', { username, reason, ip, timestamp: new Date().toISOString() }),
    
    logout: (username: string, ip?: string) => 
      log(LogLevel.INFO, 'AUTH', 'User logged out', { username, ip, timestamp: new Date().toISOString() }),
    
    tokenCreate: (sub: string) => 
      log(LogLevel.DEBUG, 'AUTH', 'Token created', { sub, timestamp: new Date().toISOString() }),
    
    tokenVerify: (valid: boolean, sub?: string) => 
      log(LogLevel.DEBUG, 'AUTH', valid ? 'Token verified' : 'Token verification failed', 
        { valid, sub, timestamp: new Date().toISOString() })
  }
};

export default logger; 