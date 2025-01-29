import { FastifyInstance } from "fastify";
import { WorkGetOneProps } from "../../modules/work/model/work_interfaces";
import { WorkCreateController, WorkDeleteController, WorkGetController, WorkGetFilteredController, WorkUpdateController } from "../../modules/work/controllers/work_controller";

async function workRoutes(app: FastifyInstance) {
  app.post("/work", async (request, reply) => {
    return new WorkCreateController().handle(request, reply);
  });

  app.get("/work", async (request, reply) => {
    const { userId, name, description, price } = request.query as WorkGetOneProps;
    if (userId || name || description || price) {
      // Caso tenha filtros, chama o controller para busca filtrada
      return new WorkGetFilteredController().handle(request, reply);
    }
    // Caso contrário, chama o controller para buscar todos os agendamentos
    return new WorkGetController().handle(request, reply);
  });

  app.delete("/work", async (request, reply) => {
    return new WorkDeleteController().handle(request, reply);
  });

  app.put("/work", async (request, reply) => {
    return new WorkUpdateController().handle(request, reply);
  });
}

export default workRoutes;
