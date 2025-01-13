import { FastifyReply } from "fastify";

// Função genérica para tratamento de erros
const handleError = (response: FastifyReply, error: Error | unknown) => {
  if (error instanceof Error) {
    response.status(400).send({ error: error.message });
  } else {
    response.status(400).send({ error: "Erro desconhecido" });
  }
};

export default handleError;