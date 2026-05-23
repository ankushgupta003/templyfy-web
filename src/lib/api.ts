import axios from "axios";

export type Product = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  fileType: string;
  compatibility: string;
  version: string;
  features: string[];
  includedFiles: string[];
  requirements: string;
  thumbnailUrl: string;
  galleryImages: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  relatedProducts?: Product[];
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  status: "DRAFT" | "PUBLISHED";
  seoTitle: string;
  seoDescription: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  relatedPosts?: BlogPost[];
};

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  createdAt?: string;
};

export type AuthResponse = {
  token: string;
  user: AdminUser;
};

export type ProductListResponse = {
  items: Product[];
  total: number;
};

export type CheckoutOrderResponse = {
  keyId: string;
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  product: {
    id: string;
    title: string;
    price: number;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
};

export type CheckoutVerificationResponse = {
  orderId: string;
  orderNumber: string;
  productName: string;
  customerEmail: string;
  status: string;
  emailStatus: string;
  message: string;
};

export type EmailLog = {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  errorMessage?: string | null;
  createdAt: string;
};

export type DownloadTokenRecord = {
  id: string;
  expiresAt: string;
  usedAt?: string | null;
  downloadCount: number;
  createdAt: string;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  currency: string;
  status: "CREATED" | "PAID" | "FAILED" | "REFUNDED";
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    title: string;
    category: string;
  };
  emailLogs: EmailLog[];
  downloadTokens?: DownloadTokenRecord[];
};

export type DashboardSummary = {
  metrics: {
    totalProducts: number;
    totalOrders: number;
    revenue: number;
    paidOrders: number;
    failedPayments: number;
    blogPosts: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerEmail: string;
    amount: number;
    status: string;
    productName: string;
    createdAt: string;
  }>;
  salesSeries: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
};

export type StoreSettings = {
  id: string;
  storeName: string;
  supportEmail: string;
  downloadLinkExpiryHours: number;
  integrations: {
    razorpayKeyId: string;
    emailHost: string;
    emailUser: string;
    emailFrom: string;
    webhookConfigured: boolean;
  };
};

const browserOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:4000";

export const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || `${browserOrigin}/api`;
export const API_ORIGIN = new URL(API_BASE_URL, browserOrigin).origin;
export const ADMIN_TOKEN_KEY = "templyfy_admin_token";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getStoredToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const setStoredToken = (token: string) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearStoredToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const resolveAssetUrl = (value: string) => {
  if (!value) {
    return "";
  }

  if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${API_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
};

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message ?? error.message;
  }

  return error instanceof Error ? error.message : "Something went wrong.";
};
