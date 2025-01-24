import { FastifyInstance } from "fastify";
import paymentWebhookController from "../../modules/payments/controller/payment_controller";

async function paymentRoutes(app: FastifyInstance) {
  app.post('/webhook', async (request, reply) => {
    return new paymentWebhookController().handle(request, reply);
  });
}

export default paymentRoutes;
