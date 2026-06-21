"use client";

// Default phrases — the user can customise these from their profile in a future iteration.
const DEFAULT_PHRASES = [
  "Yes please",
  "No thank you",
  "Tell me more",
  "Go back",
  "Submit it",
  "Find nearby",
  "Read the menu",
  "Help me",
];

export default function AACQuickReplies({
  onSelect,
}: {
  onSelect: (phrase: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        padding: "0 16px 8px",
        scrollbarWidth: "none",
      }}
    >
      {DEFAULT_PHRASES.map((phrase) => (
        <button
          key={phrase}
          onClick={() => onSelect(phrase)}
          style={{
            flexShrink: 0,
            padding: "7px 14px",
            borderRadius: "var(--radius-pill)",
            border: "1.5px solid var(--ana)",
            background: "var(--ana-soft)",
            color: "var(--ana-dark)",
            fontSize: "0.76rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            whiteSpace: "nowrap",
          }}
        >
          {phrase}
        </button>
      ))}
    </div>
  );
}
