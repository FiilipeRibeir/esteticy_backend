import EventEmitter from "events";
import PaymentProviderFactory from "./payment_provider_factory";

interface PaymentCreateProps {
  userId: string;
  external_reference: string;
  transactionAmount: number;
  description: string;
  paymentMethodId: string;
  email: string;
}

interface PaymentWebhookProps {
  resource: string;
  topic: string;
}

type PaymentEventProps = { resource: string; topic: string };
export const paymentEvents = new EventEmitter();

paymentEvents.on("payment.update", async (data: PaymentEventProps) => {
  try {
    const providerName = "mercadopago";
    const provider = PaymentProviderFactory.getProvider(providerName);
    await provider.webhook(data);
  } catch (error) {
    console.error("Error processing payment update event:", error);
  }
});

interface PaymentProvider {
  createPayment(data: PaymentCreateProps): Promise<any>;
  webhook(data: PaymentWebhookProps): Promise<any>;
}

export { PaymentCreateProps, PaymentProvider, PaymentWebhookProps };

