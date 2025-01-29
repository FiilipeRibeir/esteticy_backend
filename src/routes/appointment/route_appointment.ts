import { FastifyInstance } from "fastify";
import { AppointmentCreateController, AppointmentDeleteController, AppointmentGetController, AppointmentGetFilteredController, AppointmentUpdateController } from "../../modules/appointments/controller/appointment_controller";

async function appointmentRoutes(app: FastifyInstance) {
  app.post("/appointment", async (request, reply) => {
    return new AppointmentCreateController().handle(request, reply);
  });

  app.get("/appointment", async (request, reply) => {
    const { userId, date, status } = request.query as { userId?: string; date?: string, status?: string };
    if (userId || date || status) {
      // Caso tenha filtros, chama o controller para busca filtrada
      return new AppointmentGetFilteredController().handle(request, reply);
    }
    // Caso contrário, chama o controller para buscar todos os agendamentos
    return new AppointmentGetController().handle(request, reply);
  });

  app.delete("/appointment", async (request, reply) => {
    return new AppointmentDeleteController().handle(request, reply);
  });

  app.put("/appointment", async (request, reply) => {
    return new AppointmentUpdateController().handle(request, reply);
  });
}

export default appointmentRoutes;
