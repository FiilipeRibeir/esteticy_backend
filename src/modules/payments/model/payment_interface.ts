interface PaymentCreateProps {
  external_reference: string;
  transactionAmount: number;
  description: string;
  paymentMethodId: string;
  email: string;
}

interface PaymentWebhookProps {
  id: string
  topic: string
}

export { PaymentCreateProps, PaymentWebhookProps };
