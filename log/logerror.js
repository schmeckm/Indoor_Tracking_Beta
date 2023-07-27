const winston = require('winston');
const path = require('path');
const logPath = path.join(__dirname, '../log', 'error.log');

const Errorlogger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  defaultMeta: { Backend: "API-Error" },
  transports: [
    new winston.transports.File({ filename: logPath, level: "error" }),
  ],
});
module.exports = Errorlogger;