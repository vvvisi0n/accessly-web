"use client";

// Score color and label helpers are exported so venue cards, map pins, and
// other components can stay consistent without re-deriving the thresholds.
export function scoreColor(score: number | null): string {
  if (score === null) return "var(--score-grey)";
  if (score >= 75) return "var(--score-green)";
  if (score >= 50) return "var(--score-amber)";
  return "var(--score-red)";
}

export function scoreLabel(score: number | null): string {
  if (score === null) return "New";
  if (score >= 75) return "Great access";
  if (score >= 50) return "Some issues";
  return "Limited access";
}

// Size specs extracted directly from the reference HTML files:
//   sm → accessana-search-map.html  .score-ring  (venue cards, list view)
//   lg → accessana-venue-page.html  .index-ring-big  (venue hero)
//   md → interpolated between the two
const SIZE = {
  sm: { px: 34, viewBox: 36, cx: 18, cy: 18, r: 13, sw: 3, numSize: "0.58rem" },
  md: { px: 52, viewBox: 52, cx: 26, cy: 26, r: 22, sw: 4, numSize: "0.80rem" },
  lg: { px: 72, viewBox: 72, cx: 36, cy: 36, r: 31, sw: 5, numSize: "1.30rem" },
} as const;

export interface ScoreRingProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
  /** Suppress the "/ 100" sub-label shown in lg by default. */
  hideSub?: boolean;
}

export default function ScoreRing({ score, size = "md", hideSub = false }: ScoreRingProps) {
  const s = SIZE[size];
  const circumference = 2 * Math.PI * s.r;
  const dash = score === null ? 0 : Math.max(0, Math.min(1, score / 100)) * circumference;
  const color = scoreColor(score);

  return (
    <div
      style={{
        position: "relative",
        width: s.px,
        height: s.px,
        flexShrink: 0,
      }}
      role="img"
      aria-label={score === null ? "No score yet" : `Access Index score: ${score} out of 100`}
    >
      {/* Ring SVG — rotated -90° so the arc starts at the top */}
      <svg
        viewBox={`0 0 ${s.viewBox} ${s.viewBox}`}
        width={s.px}
        height={s.px}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle cx={s.cx} cy={s.cy} r={s.r} fill="none" stroke="var(--border)" strokeWidth={s.sw} />
        {/* Fill */}
        <circle
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="none"
          stroke={color}
          strokeWidth={s.sw}
          strokeLinecap="round"
          strokeDasharray={`${dash} 9999`}
          style={{ transition: "stroke-dasharray 0.4s ease, stroke 0.3s ease" }}
        />
      </svg>

      {/* Center label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        <span
          style={{
            fontSize: s.numSize,
            fontWeight: 800,
            color: score === null ? "var(--ink-3)" : "var(--ink)",
            fontFamily: "var(--font-body)",
          }}
        >
          {score === null ? "New" : score}
        </span>
        {size === "lg" && !hideSub && score !== null && (
          <span
            style={{
              fontSize: "0.52rem",
              fontWeight: 600,
              color: "var(--ink-3)",
              marginTop: 2,
            }}
          >
            / 100
          </span>
        )}
      </div>
    </div>
  );
}
