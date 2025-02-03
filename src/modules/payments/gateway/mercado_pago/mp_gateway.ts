import { PaymentStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { HttpError } from "../../../../config/error";
import logger from "../../../../config/logger";
import prismaClient from "../../../../prisma";
import OAuthService from "../../../oauth_mp/service/oauth_mp_service";
import MercadoPagoError from "../../utils/Error";
import { PaymentCreateProps, PaymentProvider, PaymentWebhookProps } from "../provider/payment_gateway_interface";

class MercadoPagoProvider implements PaymentProvider {
  async createPayment(data: PaymentCreateProps) {
    const user = await prismaClient.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new HttpError("User not found", 404);
    }

    let mptoken = await prismaClient.mercadoPagoToken.findUnique({
      where: { userId: data.userId },
    });

    if (!mptoken) {
      throw new HttpError("Mercado Pago token not found", 404);
    }

    const now = new Date();
    if (mptoken.expiresAt <= now) {
      try {
        const tokenResponse = await new OAuthService(
          process.env.MERCADO_PAGO_CLIENT_ID!,
          process.env.MERCADO_PAGO_CLIENT_SECRET!,
          process.env.MERCADO_PAGO_REDIRECT_URI!
        ).refreshAccessToken(mptoken.refreshToken);

        mptoken = await prismaClient.mercadoPagoToken.update({
          where: { userId: data.userId },
          data: {
            accessToken: tokenResponse.access_token,
            expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
          },
        });

        console.log("Access token successfully refreshed.");
      } catch (error) {
        console.error("Failed to refresh access token:", error);
        throw new HttpError("Failed to refresh Mercado Pago access token", 500);
      }
    }

    if (!process.env.WEBHOOK_URL) {
      throw new Error("WEBHOOK_URL is not defined!");
    }

    const client = new MercadoPagoConfig({
      accessToken: mptoken.accessToken,
      options: { timeout: 5000 },
    });

    const payment = new Payment(client);

    const date = new Date();
    const expirationDate = new Date(date.getTime() + 15 * 60 * 1000); // Expira em 15 minutos

    const body = {
      transaction_amount: data.transactionAmount,
      description: data.description,
      payment_method_id: data.paymentMethodId,
      payer: {
        email: data.email,
      },
      notification_url: process.env.WEBHOOK_URL,
      external_reference: data.external_reference,
      date_of_expiration: expirationDate.toISOString(),
    };

    const requestOptions = {
      idempotencyKey: randomUUID(),
    };

    try {
      const response = await payment.create({ body, requestOptions });

      if (!response.id) {
        throw new Error("Transaction ID not returned by Mercado Pago. Invalid payment.");
      }

      const transactionId = response.id;

      const paymentDb = await prismaClient.payment.create({
        data: {
          userId: data.userId,
          appointmentId: data.external_reference,
          amount: data.transactionAmount,
          status: PaymentStatus.PENDENTE,
          method: data.paymentMethodId,
          transactionId: transactionId.toString(),
          expiresAt: expirationDate,
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

  async webhook(data: PaymentWebhookProps) {
    if (!data.resource || !data.topic) {
      throw new HttpError("Incomplete data", 400);
    }

    try {
      if (data.topic !== "payment") {
        return { message: "Event ignored" };
      }

      const payment = await prismaClient.payment.findUnique({
        where: { transactionId: data.resource },
        include: { user: true },
      });

      if (!payment || !payment.user) {
        logger.error("Payment or associated user not found", { resource: data.resource });
        throw new HttpError("Payment or user not found", 404);
      }

      if (payment.expiresAt > new Date()) {
        return { message: "Pagamento ainda válido" };
      }

      // Verificar se o pagamento existe antes de tentar excluir
      const paymentToDelete = await prismaClient.payment.findUnique({
        where: { transactionId: data.resource },
      });

      if (paymentToDelete) {
        await prismaClient.payment.delete({ where: { transactionId: data.resource } });

        await prismaClient.appointment.delete({ where: { id: payment.appointmentId } });
      } else {
      }

      return { message: "Payment expired and removed from database" };
    } catch (error) {
      logger.error(`Error processing webhook: ${error}`, { resource: data.resource, topic: data.topic });
      throw new HttpError("Error processing webhook", 500);
    }
  }
}

export default MercadoPagoProvider;
