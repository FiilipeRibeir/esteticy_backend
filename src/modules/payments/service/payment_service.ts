import { PaymentStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { HttpError } from "../../../config/error";
import logger from "../../../config/logger";
import prismaClient from "../../../prisma";
import { PaymentCreateProps, PaymentWebhookProps } from "../model/payment_interface";
import MercadoPagoError from "../utils/Error";

class CreatePaymentService {
  async execute({ userId, external_reference, transactionAmount, description, paymentMethodId, email }: PaymentCreateProps): Promise<any> {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpError("user not found", 404);
    }

    const client = new MercadoPagoConfig({
      accessToken: /* user.accessToken */ process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
      options: { timeout: 5000 },
    });

    const payment = new Payment(client);

    const body = {
      transaction_amount: transactionAmount,
      description,
      payment_method_id: paymentMethodId,
      payer: {
        email,
      },
      notification_url: process.env.WEBHOOK_URL,
      external_reference,
    };

    const requestOptions = {
      idempotencyKey: randomUUID(),
    };

    try {
      const response = await payment.create({ body, requestOptions });

      if (!response.id) {
        throw new Error(
          "Transaction ID not returned by Mercado Pago. Invalid payment."
        );
      }

      const transactionId = response.id;

      const paymentDb = await prismaClient.payment.create({
        data: {
          userId: userId,
          appointmentId: external_reference,
          amount: transactionAmount,
          status: PaymentStatus.PENDENTE,
          method: paymentMethodId,
          transactionId: transactionId.toString(),
        },
      });

      return {
        mercadoPagoResponse: response,
        paymentdb: paymentDb,
      };
    } catch (error) {
      if (error instanceof MercadoPagoError) {
        logger.error(`MercadoPago error: ${error.message}`);
      } else {
        logger.error(`Unknown error: ${(error as Error).message}`);
      }
      throw error;
    }
  }
}

class WebhookService {
  async execute({ resource, topic }: PaymentWebhookProps) {
    if (!resource || !topic) {
      logger.warn("Incomplete data in webhook", { resource, topic });
      throw new HttpError("Incomplete data", 400);
    }

    try {
      if (topic !== "payment") {
        logger.warn(`Unrecognized event: ${topic}`);
        return { message: "Event ignored" };
      }

      // Buscar o pagamento pelo transactionId
      const payment = await prismaClient.payment.findUnique({
        where: { transactionId: resource },
        include: { user: true },
      });

      if (!payment || !payment.user) {
        logger.error("Payment or associated user not found", { resource });
        throw new HttpError("Payment or user not found", 404);
      }

      // Criar cliente Mercado Pago
      const client = new MercadoPagoConfig({
        accessToken: /* payment.user.accessToken */ process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
        options: { timeout: 5000 },
      });

      const paymentApi = new Payment(client);
      const paymentResponse = await paymentApi.get({ id: resource });

      if (!paymentResponse.external_reference) {
        logger.error("External reference missing in payment response");
        throw new HttpError("External reference missing", 400);
      }

      const { status, transaction_amount: amount, external_reference } = paymentResponse;

      // Atualizar status do pagamento no banco
      const updatedPayment = await prismaClient.payment.update({
        where: { transactionId: resource },
        data: {
          amount,
          status: status === "approved" ? PaymentStatus.CONFIRMADO : PaymentStatus.PENDENTE,
        },
      });

      await prismaClient.appointment.update({
        where: { id: external_reference },
        data: {
          paymentStatus: updatedPayment.status,
          paidAmount: amount,
        },
      });

      return {
        message: "Payment and appointment updated successfully",
        payment: { transactionId: resource, amount, status },
      };
    } catch (error) {
      logger.error(`Error processing webhook: ${error}`, { resource, topic });
      throw new HttpError("Error processing webhook", 500);
    }
  }
}

export { CreatePaymentService, WebhookService };
