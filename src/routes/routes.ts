import { FastifyInstance } from "fastify";

async function routes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    reply.send("API funcionando!");
  });

  app.get("/health", async (request, reply) => {
    reply.send({ status: "OK" });
  });

  app.get("/users", async (request, reply) => {
    reply.send([{ id: 1, name: "John Doe" }]);
  });
}

export default routes;
