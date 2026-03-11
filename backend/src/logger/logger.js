import winston from 'winston';
import DailyRotateFile from "winston-daily-rotate-file";

const logDir = '../logs';

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [

    new DailyRotateFile({
      filename: logDir + "/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "14d"
    }),

    new DailyRotateFile({
      filename: logDir + "/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d"
    }),

    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});