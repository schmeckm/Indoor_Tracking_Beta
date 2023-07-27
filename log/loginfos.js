const winston = require('winston');
const path = require('path');
const logPath = path.join(__dirname, '../log', 'info.log');

const InfoLogger = winston.createLogger({
  level: "Info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { Backend: "Information" },
  transports: [
    new winston.transports.File({ filename: logPath, level: "info" }),
  ],
});
module.exports = InfoLogger;