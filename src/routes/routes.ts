import { FastifyInstance } from "fastify";
import appointmentRoutes from "./appointment/route_appointment";
import oauthRoutes from "./oauth_mp/route_mp_oauth";
import paymentRoutes from "./payment/route_payment";
import userRoutes from "./user/route_user";
import workRoutes from "./work/route_work";

async function routes(app: FastifyInstance) {
  await userRoutes(app);         // Registra as rotas de usuários
  await appointmentRoutes(app); // Registra as rotas de agendamentos
  await workRoutes(app);        // Registra as rotas de trabalhos
  await paymentRoutes(app);     // Registra as rotas de pagamentos
  await oauthRoutes(app);
}

export default routes;
