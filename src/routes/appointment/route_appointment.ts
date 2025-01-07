import { FastifyInstance } from "fastify";
import {
  appointmentCreateController,
  appointmentDeleteController,
  appointmentGetController,
  appointmentGetFilteredController,
  appointmentUpdateController,
  appointmentUpdateStatusController // Novo controlador para atualizar status
} from "../../modules/appointments/controller/appointment_controller";

async function appointmentRoutes(app: FastifyInstance) {
  // Rota POST para criação de appointment
  app.post("/appointment", async (request, reply) => {
    return new appointmentCreateController().handle(request, reply);
  });

  // Rota GET para listar agendamentos
  app.get("/appointment", async (request, reply) => {
    const { userId, date, status } = request.query as { userId?: string; date?: string, status?: string };
    // Verifica se foram passados filtros específicos
    if (userId || date || status) {
      // Caso tenha filtros, chama o controller para busca filtrada
      return new appointmentGetFilteredController().handle(request, reply);
    }
    // Caso contrário, chama o controller para buscar todos os agendamentos
    return new appointmentGetController().handle(request, reply);
  });

  // Rota DELETE para deletar um appointment
  app.delete("/appointment", async (request, reply) => {
    return new appointmentDeleteController().handle(request, reply);
  });

  // Rota PUT para reagendar um appointment (atualizar data e status)
  app.put("/appointment", async (request, reply) => {
    return new appointmentUpdateController().handle(request, reply);
  });

  // Rota PATCH para atualizar apenas o status do appointment
  app.patch("/appointment", async (request, reply) => {
    return new appointmentUpdateStatusController().handle(request, reply);
  });
}

export default appointmentRoutes;
