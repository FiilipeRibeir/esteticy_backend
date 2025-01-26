import { FastifyReply, FastifyRequest } from "fastify";
import { HttpError } from "../../../config/error";
import logger from "../../../config/logger";
import { PaymentWebhookProps } from "../model/payment_interface";
import { PaymentWebhookService } from "../service/payment_service";

class paymentWebhookController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { id, topic } = request.body as PaymentWebhookProps;

      const paymentService = new PaymentWebhookService();
      const payment = await paymentService.execute({ id, topic });

      response.send(payment);
    } catch (error) {
      if (error instanceof HttpError) {
        logger.error(`Erro HttpError: ${error.message}`);
        response.status(error.statusCode).send({ error: error.message });
      } else {
        logger.error(`Erro desconhecido: ${(error as Error).message}`);
        response.status(500).send({ error: "Erro interno do servidor" });
      }
    }
  }
}

export { paymentWebhookController };
