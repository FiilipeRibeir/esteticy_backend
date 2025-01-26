class MercadoPagoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MercadoPagoError";
  }
}

export default MercadoPagoError;