import { FastifyInstance } from "fastify";
import appointmentRoutes from "./appointment/route_appointment";
import userRoutes from "./user/route_user";
import workRoutes from "./work/route_work";

async function routes(app: FastifyInstance) {
  await userRoutes(app);         // Registra as rotas de usuários
  await appointmentRoutes(app); // Registra as rotas de agendamentos
  await workRoutes(app);        // Registra as rotas de trabalhos
}

export default routes;
