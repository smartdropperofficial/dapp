// /utils/logger.ts
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    format.printf(({ timestamp, level, message, ...metadata }) => {
      const meta = metadata[Object.keys(metadata)[0]] ? JSON.stringify(metadata[Object.keys(metadata)[0]]) : '';
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${meta}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'app.log' })
  ]
});

export default logger;
