import { FastifyReply, FastifyRequest } from "fastify";
import handleError from "../../../config/handle_error";
import { PaymentWebhookProps } from "../model/payment_interface";
import { PaymentWebhookService } from "../service/payment_service";

class paymentWebhookController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      const { paymentId, transactionAmount, status, appointmentId } = request.body as PaymentWebhookProps;
      const paymentService = new PaymentWebhookService();
      const payment = paymentService.execute({ paymentId, transactionAmount, status, appointmentId });
      response.send(payment);
    } catch (error) {
      handleError(response, error);
    }
  }
}

export default paymentWebhookController;
