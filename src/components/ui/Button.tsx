"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  /** Full-width block button */
  block?: boolean;
  children: ReactNode;
}

const BASE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  border: "none",
  borderRadius: "var(--radius-sm)",
  fontFamily: "var(--font-body)",
  fontWeight: 600,
  letterSpacing: "-0.01em",
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s, border-color 0.15s, opacity 0.15s",
  textDecoration: "none",
  userSelect: "none",
};

const SIZE_STYLES: Record<NonNullable<ButtonProps["size"]>, React.CSSProperties> = {
  sm: { fontSize: "0.78rem", padding: "7px 14px" },
  md: { fontSize: "0.88rem", padding: "10px 20px" },
  lg: { fontSize: "0.95rem", padding: "13px 28px" },
};

const VARIANT_STYLES: Record<NonNullable<ButtonProps["variant"]>, React.CSSProperties> = {
  primary: {
    background: "var(--blue)",
    color: "#fff",
    border: "none",
  },
  outline: {
    background: "transparent",
    color: "var(--ink)",
    border: "1.5px solid var(--border)",
  },
  ghost: {
    background: "transparent",
    color: "var(--ink-2)",
    border: "1.5px solid transparent",
  },
};

export default function Button({
  variant = "primary",
  size = "md",
  block = false,
  style,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        ...BASE,
        ...SIZE_STYLES[size],
        ...VARIANT_STYLES[variant],
        ...(block ? { width: "100%" } : {}),
        ...(disabled ? { opacity: 0.45, cursor: "not-allowed" } : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}
