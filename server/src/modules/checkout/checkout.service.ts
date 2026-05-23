import crypto from "node:crypto";
import { OrderStatus, type Order } from "@prisma/client";
import { z } from "zod";
import { env } from "../../config/env";
import { mailer } from "../../config/mailer";
import { prisma } from "../../config/prisma";
import { razorpay } from "../../config/razorpay";
import { AppError } from "../../middleware/errorHandler";
import { settingsService } from "../settings/settings.service";
import { downloadReadyEmail } from "../../utils/emailTemplates";
import { createDownloadToken } from "../../utils/tokens";
import {
  validateRazorpayPaymentSignature,
  validateWebhookSignature,
} from "../../utils/validateRazorpaySignature";

const createOrderSchema = z.object({
  productId: z.string().min(1),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8).max(20),
});

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

const createOrderNumber = () => {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TMP-${stamp}-${random}`;
};

const buildOrderSummary = (order: Order & { product: { title: string } }) => ({
  orderId: order.id,
  orderNumber: order.orderNumber,
  productName: order.product.title,
  customerEmail: order.customerEmail,
  status: order.status,
});

export const dispatchDownloadEmailForOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: true,
    },
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  if (order.status !== OrderStatus.PAID) {
    throw new AppError("Only paid orders can receive download emails.", 400);
  }

  const settings = await settingsService.getStoreSettings();
  const tokenId = crypto.randomUUID();
  const tokenBundle = createDownloadToken(
    {
      orderId: order.id,
      tokenId,
    },
    settings.downloadLinkExpiryHours,
  );

  await prisma.downloadToken.create({
    data: {
      id: tokenId,
      orderId: order.id,
      tokenHash: tokenBundle.tokenHash,
      expiresAt: tokenBundle.expiresAt,
    },
  });

  const message = downloadReadyEmail({
    customerName: order.customerName,
    productName: order.product.title,
    orderNumber: order.orderNumber,
    downloadUrl: `${env.APP_URL}/api/download/${tokenBundle.token}`,
    expiryHours: settings.downloadLinkExpiryHours,
    supportEmail: settings.supportEmail,
  });

  try {
    await mailer.sendMail({
      from: env.EMAIL_FROM,
      to: order.customerEmail,
      subject: message.subject,
      html: message.html,
    });

    await prisma.emailLog.create({
      data: {
        orderId: order.id,
        recipient: order.customerEmail,
        subject: message.subject,
        status: "SENT",
      },
    });

    return {
      status: "SENT" as const,
      downloadUrl: `${env.APP_URL}/api/download/${tokenBundle.token}`,
    };
  } catch (error) {
    await prisma.emailLog.create({
      data: {
        orderId: order.id,
        recipient: order.customerEmail,
        subject: message.subject,
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown mailer error",
      },
    });

    return {
      status: "FAILED" as const,
      downloadUrl: `${env.APP_URL}/api/download/${tokenBundle.token}`,
    };
  }
};

const markOrderAsPaid = async (params: {
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
}) => {
  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: params.razorpayOrderId },
    include: { product: true },
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  if (order.status === OrderStatus.PAID) {
    return {
      order,
      emailStatus: "ALREADY_PAID" as const,
    };
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.PAID,
      razorpayPaymentId: params.razorpayPaymentId ?? order.razorpayPaymentId,
      razorpaySignature: params.razorpaySignature ?? order.razorpaySignature,
      paidAt: new Date(),
    },
    include: {
      product: true,
    },
  });

  const emailResult = await dispatchDownloadEmailForOrder(updatedOrder.id);
  return {
    order: updatedOrder,
    emailStatus: emailResult.status,
  };
};

export const checkoutService = {
  async createOrder(payload: unknown) {
    const input = createOrderSchema.parse(payload);

    const product = await prisma.product.findFirst({
      where: {
        id: input.productId,
        isActive: true,
      },
    });

    if (!product) {
      throw new AppError("Selected product is unavailable.", 404);
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: product.price * 100,
      currency: env.APP_URL.includes("localhost") ? "INR" : "INR",
      receipt: createOrderNumber(),
      notes: {
        productId: product.id,
        customerEmail: input.customerEmail,
      },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber: razorpayOrder.receipt ?? createOrderNumber(),
        customerName: input.customerName,
        customerEmail: input.customerEmail.toLowerCase(),
        customerPhone: input.customerPhone,
        productId: product.id,
        amount: product.price,
        currency: "INR",
        status: OrderStatus.CREATED,
        razorpayOrderId: razorpayOrder.id,
      },
    });

    return {
      keyId: env.RAZORPAY_KEY_ID,
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
      },
      customer: {
        name: input.customerName,
        email: input.customerEmail,
        phone: input.customerPhone,
      },
    };
  },

  async verifyPayment(payload: unknown) {
    const input = verifyPaymentSchema.parse(payload);

    const isValid = validateRazorpayPaymentSignature({
      orderId: input.razorpayOrderId,
      paymentId: input.razorpayPaymentId,
      signature: input.razorpaySignature,
      secret: env.RAZORPAY_KEY_SECRET,
    });

    if (!isValid) {
      await prisma.order.updateMany({
        where: { razorpayOrderId: input.razorpayOrderId },
        data: { status: OrderStatus.FAILED },
      });

      throw new AppError("Payment signature verification failed.", 400);
    }

    const result = await markOrderAsPaid({
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      razorpaySignature: input.razorpaySignature,
    });

    return {
      ...buildOrderSummary(result.order),
      emailStatus: result.emailStatus,
      message:
        result.emailStatus === "FAILED"
          ? "Payment verified, but the email could not be sent automatically."
          : "Payment verified successfully.",
    };
  },

  async handleWebhook(rawBody: Buffer, signature: string | undefined) {
    if (!signature) {
      throw new AppError("Missing webhook signature.", 400);
    }

    if (!validateWebhookSignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET)) {
      throw new AppError("Invalid webhook signature.", 400);
    }

    const event = JSON.parse(rawBody.toString("utf8")) as {
      event: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
          };
        };
        order?: {
          entity?: {
            id?: string;
          };
        };
        refund?: {
          entity?: {
            payment_id?: string;
          };
        };
      };
    };

    const paymentEntity = event.payload?.payment?.entity;

    if (event.event === "payment.captured" && paymentEntity?.order_id) {
      await markOrderAsPaid({
        razorpayOrderId: paymentEntity.order_id,
        razorpayPaymentId: paymentEntity.id,
      });
    }

    if (event.event === "payment.failed" && paymentEntity?.order_id) {
      await prisma.order.updateMany({
        where: { razorpayOrderId: paymentEntity.order_id },
        data: {
          status: OrderStatus.FAILED,
          razorpayPaymentId: paymentEntity.id ?? null,
        },
      });
    }

    if (event.event === "refund.processed" && event.payload?.refund?.entity?.payment_id) {
      await prisma.order.updateMany({
        where: { razorpayPaymentId: event.payload.refund.entity.payment_id },
        data: {
          status: OrderStatus.REFUNDED,
        },
      });
    }

    if (event.event === "order.paid" && event.payload?.order?.entity?.id) {
      await markOrderAsPaid({
        razorpayOrderId: event.payload.order.entity.id,
      });
    }

    return { received: true };
  },
};

