const { transports, createLogger, format } = require("winston");

// Config logger
const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  // Set up transports
  transports: [
    // new transports.Console(),
    new transports.File({ filename: "./logs/error.log", level: "error" }),
    new transports.File({ filename: "./logs/info.log", level: "info" }),
  ],
});

module.exports = logger;
