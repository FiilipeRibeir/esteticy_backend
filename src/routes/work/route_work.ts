import { FastifyInstance } from "fastify";
import { workCreateController, workDeleteController, workGetController, workGetFilteredController, workUpdateController } from "../../modules/work/controllers/work_controller";
import { WorkGetOneProps } from "../../modules/work/model/work_interfaces";

async function workRoutes(app: FastifyInstance) {
  // Rota POST para criação do work
  app.post("/work", async (request, reply) => {
    return new workCreateController().handle(request, reply);
  });

  // Rota GET para listar agendamentos
  app.get("/work", async (request, reply) => {
    const { userId, name, description, price } = request.query as WorkGetOneProps;
    // Verifica se foram passados filtros específicos
    if (userId || name || description || price) {
      // Caso tenha filtros, chama o controller para busca filtrada
      return new workGetFilteredController().handle(request, reply);
    }
    // Caso contrário, chama o controller para buscar todos os agendamentos
    return new workGetController().handle(request, reply);
  });

  app.delete("/work", async (request, reply) => {
    return new workDeleteController().handle(request, reply);
  });

  app.put("/work", async (request, reply) => {
    return new workUpdateController().handle(request, reply);
  });
}

export default workRoutes;
