import crypto from "node:crypto";

export const validateRazorpayPaymentSignature = (params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}) => {
  const expected = crypto
    .createHmac("sha256", params.secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  return expected === params.signature;
};

export const validateWebhookSignature = (payload: Buffer, signature: string, secret: string) => {
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return expected === signature;
};

