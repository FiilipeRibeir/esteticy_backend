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

export { PaymentCreateProps, PaymentWebhookProps };
