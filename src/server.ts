import dotenv from "dotenv";
import app from "./app";
import logger from "./config/logger";

// Carregar variáveis do .env
dotenv.config();

const startServer = async () => {
    try {
        await app.listen({ port: Number(process.env.PORT), host: "0.0.0.0" });
        logger.info(`🌟 Modo de desenvolvimento: ${process.env.DEV_MODE ? "Ativado" : "Desativado"}`);
        logger.info(`🚀 Servidor rodando em http://localhost:${process.env.PORT}`);
    } catch (error) {
        logger.error("Erro ao iniciar o servidor:", error);
        process.exit(1); // Encerra com erro
    }
};

startServer();

// Encerramento gracioso
process.on("SIGINT", async () => {
    logger.info("🛑 Servidor interrompido manualmente (Ctrl+C)");
    try {
        await app.close();
        logger.info("Servidor encerrado com sucesso.");
        process.exit(0);
    } catch (error) {
        logger.error("Erro ao encerrar o servidor:", error);
        process.exit(1);
    }
});

process.on("SIGTERM", async () => {
    logger.info("🛑 Servidor recebeu sinal de encerramento");
    try {
        await app.close();
        logger.info("Servidor encerrado com sucesso.");
        process.exit(0);
    } catch (error) {
        logger.error("Erro ao encerrar o servidor:", error);
        process.exit(1);
    }
});
