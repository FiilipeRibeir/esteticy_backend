import dotenv from "dotenv";
import Fastify from "fastify";
import logger from "./config/logger";
import routes from "./routes/routes";

dotenv.config();

const app = Fastify({ logger: true });

// Registrar rotas
app.register(routes);

// Middleware de erro global
app.setErrorHandler((error, _request, reply) => {
    logger.error(`Erro: ${error.message}`);
    reply.status(500).send({ error: "Ocorreu um erro no servidor" });
});

export default app;
