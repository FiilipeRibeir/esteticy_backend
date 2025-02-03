import MercadoPagoProvider from "../mercado_pago/mp_gateway";
import { PaymentProvider } from "./payment_gateway_interface";

class PaymentProviderFactory {
  static getProvider(providerName: string): PaymentProvider {
    switch (providerName) {
      case "mercadopago":
        return new MercadoPagoProvider();
      default:
        throw new Error("Unsupported payment provider");
    }
  }
}

export default PaymentProviderFactory;
