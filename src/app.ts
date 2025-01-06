import dotenv from "dotenv";
import Fastify from "fastify";
import logger from "./config/logger";
import routes from "./routes/routes";

dotenv.config();

const app = Fastify({ logger: true });

// Registrar rotas
app.register(routes);

// Middleware de erro global
app.setErrorHandler((error: any, _request, reply) => {
    // Verifica se o erro é esperado
    if (error.validation) {
        // Erros de validação do próprio Fastify
        logger.warn(`Erro de validação: ${error.message}`);
        return reply.status(400).send({ error: error.message });
    }

    if (error instanceof Error) {
        // Erros lançados manualmente no código
        logger.warn(`Erro tratado: ${error.message}`);
        return reply.status(400).send({ error: error.message });
    }

    // Para erros inesperados
    logger.error(`Erro inesperado: ${error.message || "Erro desconhecido"}`);
    return reply.status(500).send({ error: "Ocorreu um erro no servidor" });
});

export default app;
