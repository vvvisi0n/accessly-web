import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Removes inner padding */
  flush?: boolean;
}

export default function Card({ children, flush = false, style, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      style={{
        background: "var(--bg)",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        ...(flush ? {} : { padding: "1.25rem" }),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
