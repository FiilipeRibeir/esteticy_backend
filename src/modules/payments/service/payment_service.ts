import { PaymentStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import MercadoPagoConfig, { Payment } from "mercadopago";
import HttpError from "../../../config/error";
import prismaClient from "../../../prisma";
import { PaymentCreateProps, PaymentWebhookProps } from "../model/payment_interface";

class CreatePaymentService {
  async execute({ appointmentId, transactionAmount, description, paymentMethodId, email }: PaymentCreateProps): Promise<any> {

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN is not defined');
    }

    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000, idempotencyKey: 'abc' }
    });

    const payment = new Payment(client);

    const body = {
      appointmentId,
      transaction_amount: transactionAmount,
      description: description,
      payment_method_id: paymentMethodId,
      payer: {
        email: email
      },
    };

    const requestOptions = {
      idempotencyKey: randomUUID(),
    };

    try {
      const response = await payment.create({ body, requestOptions });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

class PaymentWebhookService {
  async execute({ paymentId, transactionAmount, status, appointmentId }: PaymentWebhookProps) {
    if (!paymentId || !status || !appointmentId) {
      throw new HttpError('Dados incompletos', 400);
    }

    // Verifica se o pagamento foi confirmado
    if (status === 'approved') {
      // Atualiza o pagamento no banco de dados
      const payment = await prismaClient.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.CONFIRMADO,
        },
      });

      // Atualiza o compromisso com o valor pago
      const appointment = await prismaClient.appointment.update({
        where: { id: appointmentId },
        data: {
          paidAmount: transactionAmount, // Atualiza o valor pago no compromisso
          paymentStatus: PaymentStatus.CONFIRMADO, // Marca o pagamento como confirmado
        },
      });

      return ({
        message: "Pagamento confirmado e compromisso atualizado com sucesso!",
        payment,
        appointment,
      });
    } else {
      // Se o pagamento não for confirmado, o status pode ser PENDENTE ou CANCELADO
      await prismaClient.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.PENDENTE },
      });

      return ({ message: "Pagamento pendente." });
    }
  }
}

export { CreatePaymentService, PaymentWebhookService };
