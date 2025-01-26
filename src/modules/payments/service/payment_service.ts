import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { HttpError } from "../../../config/error";
import logger from "../../../config/logger";
import prismaClient from "../../../prisma";
import { PaymentCreateProps, PaymentWebhookProps } from "../model/payment_interface";
import MercadoPagoError from "../utils/Error";

class CreatePaymentService {
  async execute({ external_reference, transactionAmount, description, paymentMethodId, email }: PaymentCreateProps): Promise<any> {

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!token) {
      logger.error("MERCADO_PAGO_ACCESS_TOKEN is not defined");
      throw new MercadoPagoError("MERCADO_PAGO_ACCESS_TOKEN is not defined");
    }

    const client = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 5000 },
    });

    const payment = new Payment(client);

    const body = {
      external_reference,
      transaction_amount: transactionAmount,
      description,
      payment_method_id: paymentMethodId,
      payer: {
        email,
      },
      notification_url:
        "https://esteticybackend-production.up.railway.app/webhook",
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

class PaymentWebhookService {
  async execute({ id, topic }: PaymentWebhookProps) {
    if (!id || !topic) {
      logger.warn("Incomplete data in webhook", { id, topic });
      throw new HttpError("Incomplete data", 400);
    }

    // Obtendo o token do Mercado Pago
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!token) {
      logger.error("MERCADO_PAGO_ACCESS_TOKEN is not defined");
      throw new MercadoPagoError("MERCADO_PAGO_ACCESS_TOKEN is not defined");
    }

    const client = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 5000 },
    });

    switch (topic) {
      case "payment":
        try {
          const payment = new Payment(client);

          const paymentResponse = await payment.get({ id });

          const { transaction_amount: transactionAmount, status, external_reference } =
            paymentResponse;

          if (!external_reference) {
            logger.error("External reference not found in payment response.");
            throw new HttpError("External reference missing", 400);
          }

          const updatedPayment = await prismaClient.payment.updateMany({
            where: {
              transactionId: id,
            },
            data: {
              amount: transactionAmount,
              status: status === "approved" ? PaymentStatus.CONFIRMADO : PaymentStatus.PENDENTE,
            },
          });

          if (updatedPayment.count === 0) {
            logger.warn("Payment record not found to update.", { id });
            throw new HttpError("Payment record not found", 404);
          }

          const totalPaid = await prismaClient.payment.aggregate({
            _sum: { amount: true },
            where: {
              appointmentId: external_reference,
              status: PaymentStatus.CONFIRMADO,
            },
          });

          const appointment = await prismaClient.appointment.findUnique({
            where: { id: external_reference },
            include: { work: true },
          });

          if (!appointment) {
            logger.error("Appointment not found for external reference.", { external_reference });
            throw new HttpError("Appointment not found", 404);
          }

          const isFullyPaid = (totalPaid._sum.amount ?? 0) >= (appointment.work?.price ?? 0);

          await prismaClient.appointment.update({
            where: { id: external_reference },
            data: {
              paymentStatus: isFullyPaid ? PaymentStatus.CONFIRMADO : PaymentStatus.PENDENTE,
              status: isFullyPaid ? AppointmentStatus.CONCLUIDO : AppointmentStatus.PENDENTE,
              paidAmount:
                totalPaid._sum.amount ?? 0
            },
          });

          return {
            message: "Payment and appointment updated successfully",
            payment: { id, transactionAmount, status },
          };
        } catch (error) {
          logger.error(`Error processing payment webhook: ${(error as Error).message}`);
          throw new HttpError("Error processing payment webhook", 500);
        }

      default:
        logger.warn(`Unrecognized or unsupported event: ${topic}`);
        return { message: "Event ignored" };
    }
  }
}

export { CreatePaymentService, PaymentWebhookService };
