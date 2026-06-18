import type { ReactNode } from "react";

export type BadgeColor = "blue" | "violet" | "civic" | "green" | "amber" | "red" | "grey";

export interface BadgeProps {
  label: ReactNode;
  color?: BadgeColor;
  /** Slightly larger badge */
  size?: "sm" | "md";
}

const COLOR_STYLES: Record<BadgeColor, React.CSSProperties> = {
  blue: { background: "var(--blue-soft)", color: "var(--blue)" },
  violet: { background: "var(--violet-soft)", color: "var(--violet)" },
  civic: { background: "#FDECEA", color: "var(--civic)" },
  green: { background: "#E6F7F1", color: "var(--score-green)" },
  amber: { background: "#FEF3C7", color: "var(--score-amber)" },
  red: { background: "#FDECEA", color: "var(--score-red)" },
  grey: { background: "var(--surface)", color: "var(--ink-3)" },
};

export default function Badge({ label, color = "blue", size = "sm" }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        whiteSpace: "nowrap",
        fontSize: size === "sm" ? "0.68rem" : "0.78rem",
        padding: size === "sm" ? "3px 10px" : "5px 12px",
        letterSpacing: "0.01em",
        ...COLOR_STYLES[color],
      }}
    >
      {label}
    </span>
  );
}
