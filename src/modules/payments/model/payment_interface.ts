interface PaymentCreateProps {
  appointmentId: string;
  transactionAmount: number;
  description: string;
  paymentMethodId: string;
  email: string;
}

interface PaymentWebhookProps {
  paymentId: string;
  transactionAmount: number;
  status: string;
  appointmentId: string;
}

export { PaymentCreateProps, PaymentWebhookProps };
