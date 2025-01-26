import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

//format
const customFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

// Configuration logger
const logger = createLogger({
    level: "info",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        colorize(), // Color
        customFormat
    ),
    transports: [
        new transports.Console(), // Show logs in console
    ]
});

export default logger;
