import { FastifyInstance } from "fastify";
import { PaymentWebhookController } from "../../modules/payments/controller/payment_controller";

async function paymentRoutes(app: FastifyInstance) {
  app.post('/webhook', async (request, reply) => {
    return new PaymentWebhookController().handle(request, reply)
  });
}

export default paymentRoutes;
