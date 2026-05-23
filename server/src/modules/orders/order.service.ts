import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { dispatchDownloadEmailForOrder } from "../checkout/checkout.service";

const orderQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  search: z.string().optional(),
});

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const orderService = {
  async listOrders(query: unknown) {
    const filters = orderQuerySchema.parse(query);

    const items = await prisma.order.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.search
          ? {
              OR: [
                { orderNumber: { contains: filters.search, mode: "insensitive" } },
                { customerEmail: { contains: filters.search, mode: "insensitive" } },
                { customerName: { contains: filters.search, mode: "insensitive" } },
                { product: { is: { title: { contains: filters.search, mode: "insensitive" } } } },
              ],
            }
          : {}),
      },
      include: {
        product: true,
        emailLogs: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return items.map((order) => ({
      ...order,
      product: {
        id: order.product.id,
        title: order.product.title,
        category: order.product.category,
      },
    }));
  },

  async getOrder(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: true,
        emailLogs: {
          orderBy: {
            createdAt: "desc",
          },
        },
        downloadTokens: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    return order;
  },

  async resendEmail(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    const result = await dispatchDownloadEmailForOrder(order.id);

    return {
      success: result.status === "SENT",
      status: result.status,
    };
  },

  async getDashboardSummary() {
    const [totalProducts, totalOrders, paidOrders, failedPayments, blogPosts, revenueAggregate, recentOrders, salesOrders] =
      await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.count({ where: { status: OrderStatus.PAID } }),
        prisma.order.count({ where: { status: OrderStatus.FAILED } }),
        prisma.blogPost.count(),
        prisma.order.aggregate({
          where: { status: OrderStatus.PAID },
          _sum: { amount: true },
        }),
        prisma.order.findMany({
          include: {
            product: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 6,
        }),
        prisma.order.findMany({
          where: {
            status: OrderStatus.PAID,
            paidAt: {
              gte: startOfDay(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
            },
          },
          orderBy: {
            paidAt: "asc",
          },
        }),
      ]);

    const labels = [...Array(7)].map((_, index) => {
      const date = startOfDay(new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000));
      const key = date.toISOString().slice(0, 10);
      const matchingOrders = salesOrders.filter((order) => order.paidAt?.toISOString().slice(0, 10) === key);

      return {
        date: key,
        revenue: matchingOrders.reduce((sum, order) => sum + order.amount, 0),
        orders: matchingOrders.length,
      };
    });

    return {
      metrics: {
        totalProducts,
        totalOrders,
        revenue: revenueAggregate._sum.amount ?? 0,
        paidOrders,
        failedPayments,
        blogPosts,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
        amount: order.amount,
        status: order.status,
        productName: order.product.title,
        createdAt: order.createdAt,
      })),
      salesSeries: labels,
    };
  },
};
