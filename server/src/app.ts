import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { ensureStorageDirs, uploadStorageDir } from "./utils/storage";
import { authLimiter, contactLimiter, downloadLimiter } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { productRouter, adminProductRouter } from "./modules/products/product.routes";
import { blogRouter, adminBlogRouter } from "./modules/blogs/blog.routes";
import { checkoutRouter, razorpayWebhookRouter } from "./modules/checkout/checkout.routes";
import { orderRouter } from "./modules/orders/order.routes";
import { downloadRouter } from "./modules/downloads/download.routes";
import { contactRouter } from "./modules/contact/contact.routes";
import { settingsRouter } from "./modules/settings/settings.routes";

ensureStorageDirs();

export const app = express();

if (env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

const allowedOrigins = env.CORS_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (!allowedOrigins?.length) {
        callback(null, true);
        return;
      }

      callback(null, allowedOrigins.includes(origin));
    },
    credentials: false,
  }),
);
app.use(helmet());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/api/webhooks/razorpay", express.raw({ type: "application/json" }), razorpayWebhookRouter);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadStorageDir));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "templyfy-api" });
});

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/products", productRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/admin/products", adminProductRouter);
app.use("/api/admin/blogs", adminBlogRouter);
app.use("/api/admin/orders", orderRouter);
app.use("/api/admin/settings", settingsRouter);
app.use("/api/download", downloadLimiter, downloadRouter);
app.use("/api/contact", contactLimiter, contactRouter);

app.use(errorHandler);
