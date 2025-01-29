import { FastifyReply, FastifyRequest } from "fastify";
import handleError from "../../../config/handle_error";
import { WebhookService } from "../service/payment_service";

class PaymentWebhookController {
  async handle(request: FastifyRequest, response: FastifyReply) {
    try {
      console.log("Recebendo webhook:", request.body); // Log para depuração

      // Tipagem do corpo da requisição (assertion de tipo)
      const body = request.body as { resource?: string; topic?: string; data?: { id: string }; type?: string };

      let resource: string | undefined;
      let topic: string | undefined;

      // Verificando se o corpo está no formato simples com resource e topic
      if (body.resource && body.topic) {
        resource = body.resource;
        topic = body.topic;
      }
      // Verificando se o corpo está no formato mais complexo com data.id e type
      else if (body.data && body.type) {
        resource = body.data.id;
        topic = body.type;
      }

      // Verificando se os campos obrigatórios existem
      if (!resource || !topic) {
        throw new Error("Campos obrigatórios ausentes no webhook");
      }

      const webhookService = new WebhookService();
      const webhookResponse = await webhookService.execute({ resource, topic });

      response.send(webhookResponse);
    } catch (error) {
      console.error("Erro no webhook:", error);
      handleError(response, error);
    }
  }
}

export { PaymentWebhookController };
