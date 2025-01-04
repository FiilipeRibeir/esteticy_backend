import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

// Formato personalizado para os logs
const customFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

// Configuração do logger
const logger = createLogger({
    level: "info",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        colorize(), // Adiciona cores no console
        customFormat
    ),
    transports: [
        new transports.Console(), // Mostra logs no console
    ]
});

export default logger;
