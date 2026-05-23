import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export const buttonStyles = ({
  variant = "primary",
  size = "md",
  className,
}: Pick<ButtonProps, "variant" | "size" | "className"> = {}) =>
  cn(
    "inline-flex items-center justify-center rounded-xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
    variant === "primary" &&
      "bg-electric text-white hover:bg-blue-700",
    variant === "secondary" &&
      "border border-slate-200 bg-white text-ink hover:border-electric hover:text-electric",
    variant === "ghost" && "text-slateText hover:bg-slate-100 hover:text-ink",
    variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
    size === "sm" && "px-3 py-2 text-xs",
    size === "md" && "px-4 py-2.5 text-sm",
    size === "lg" && "px-5 py-3 text-sm",
    className,
  );

export default function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button type={props.type ?? "button"} className={buttonStyles({ variant, size, className })} {...props} />;
}
