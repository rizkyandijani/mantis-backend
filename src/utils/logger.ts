import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize } = winston.format;

// Define custom format
const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const infoRotateFileTransport = new DailyRotateFile({
  filename: `logs/mantis-info-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '14d', // Keep logs for 14 days
  level: 'info',
});

const errorRotateFileTransport = new DailyRotateFile({
  filename: `logs/mantis-error-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '14d', // Keep logs for 14 days
  level: 'error',
});

// Create logger
export const logger = winston.createLogger({
  level: 'info', // can be changed to 'debug', 'warn', etc.
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    infoRotateFileTransport, 
    errorRotateFileTransport
  ],
});
