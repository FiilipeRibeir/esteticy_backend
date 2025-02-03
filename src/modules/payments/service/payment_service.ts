import { PaymentCreateProps, paymentEvents, PaymentProvider, PaymentWebhookProps } from "../gateway/provider/payment_gateway_interface";
import PaymentProviderFactory from "../gateway/provider/payment_provider_factory";

class CreatePaymentService {
  async execute(data: PaymentCreateProps): Promise<any> {
    const provider = PaymentProviderFactory.getProvider("mercadopago");
    return provider.createPayment(data);
  }
}


class WebhookService {
  async execute(data: PaymentWebhookProps): Promise<any> {
    paymentEvents.emit("payment.update", data);
  }
}

export { CreatePaymentService, WebhookService };
