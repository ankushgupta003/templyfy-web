import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value?: string | Date | null) => {
  if (!value) {
    return "Not available";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
};

export const estimateReadingTime = (content: string) => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 180));
};

export const setPageMeta = (title: string, description: string) => {
  document.title = `${title} | Templyfy`;

  const meta = document.querySelector('meta[name="description"]');

  if (meta) {
    meta.setAttribute("content", description);
  }
};

export const toTextareaValue = (items: string[]) => items.join("\n");

export const fromTextareaValue = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

