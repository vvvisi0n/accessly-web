import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessana — Find places that work for you",
  description:
    "Accessibility reviews from people with real needs. Search by disability type, read the Access Index, and know before you go.",
};

const HOW_IT_WORKS = [
  {
    n: "1",
    title: "Search your city",
    body: "Find restaurants, hotels, transit stops, and more. Filter by disability type to surface venues rated for your specific needs.",
  },
  {
    n: "2",
    title: "Read the Access Index",
    body: "Every venue gets a score from 0 to 100 built from real user reviews — broken down across five checkpoints: entrance, bathrooms, parking, staff, and sensory.",
  },
  {
    n: "3",
    title: "Leave a review",
    body: "Rate each checkpoint, upload photos, and help the next person know what to expect. Your review updates the score in real time.",
  },
];

const BREAKDOWN_ITEMS = [
  { label: "Entrance", desc: "Step-free access, door width, signage" },
  { label: "Bathrooms", desc: "Accessible stalls, turning radius, grab bars" },
  { label: "Parking", desc: "Designated spaces, proximity to entrance" },
  { label: "Staff", desc: "Awareness, helpfulness, accommodation" },
  { label: "Sensory", desc: "Noise level, lighting, sensory load" },
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* ── Nav ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
          padding: "0.9rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.2rem",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
            textDecoration: "none",
          }}
        >
          access<span style={{ color: "var(--blue)" }}>ana</span>
        </a>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link
            href="/search"
            style={{ fontSize: "0.88rem", color: "var(--ink-2)", textDecoration: "none" }}
          >
            Search
          </Link>
          <Link
            href="/map"
            style={{ fontSize: "0.88rem", color: "var(--ink-2)", textDecoration: "none" }}
          >
            Civic map
          </Link>
          <Link
            href="/profile"
            style={{
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "var(--blue)",
              textDecoration: "none",
              background: "var(--blue-soft)",
              padding: "7px 16px",
              borderRadius: "var(--radius-pill)",
            }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{ maxWidth: 680, margin: "0 auto", padding: "5rem 2rem 4rem", textAlign: "center" }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            color: "var(--blue)",
            background: "var(--blue-soft)",
            padding: "5px 14px",
            borderRadius: "var(--radius-pill)",
            marginBottom: "1.5rem",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--blue)",
              display: "inline-block",
            }}
          />
          Real accessibility reviews
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 6vw, 3rem)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.12,
            color: "var(--ink)",
            marginBottom: "1.25rem",
          }}
        >
          Find places that{" "}
          <em style={{ fontStyle: "italic", color: "var(--blue)" }}>actually work</em> for you
        </h1>

        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--ink-2)",
            lineHeight: 1.7,
            maxWidth: 520,
            margin: "0 auto 2.5rem",
          }}
        >
          Accessibility reviews from people with real needs. Search by disability type, read the
          Access Index, and know before you go.
        </p>

        {/* Search bar — navigates to /search with ?q= */}
        <form action="/search" style={{ display: "flex", gap: 8, maxWidth: 480, margin: "0 auto" }}>
          <input
            name="q"
            placeholder="Search a city, venue, or category…"
            style={{
              flex: 1,
              padding: "13px 18px",
              borderRadius: "var(--radius-sm)",
              border: "1.5px solid var(--border)",
              fontSize: "0.95rem",
              color: "var(--ink)",
              fontFamily: "var(--font-body)",
              outline: "none",
              background: "var(--bg)",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "13px 22px",
              borderRadius: "var(--radius-sm)",
              background: "var(--blue)",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              whiteSpace: "nowrap" as const,
            }}
          >
            Search
          </button>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "0.78rem", color: "var(--ink-3)" }}>
          No account needed to search.{" "}
          <Link
            href="/profile"
            style={{ color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}
          >
            Sign up
          </Link>{" "}
          to save venues and leave reviews.
        </p>
      </section>

      {/* ── How it works ── */}
      <section
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "4rem 2rem",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase" as const,
              color: "var(--blue)",
              marginBottom: "0.75rem",
            }}
          >
            How it works
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              textAlign: "center",
              marginBottom: "3rem",
              color: "var(--ink)",
            }}
          >
            From search to knowing in three steps
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {HOW_IT_WORKS.map(({ n, title, body }) => (
              <div
                key={n}
                style={{
                  background: "var(--bg)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "1.75rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--blue-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.88rem",
                    fontWeight: 800,
                    color: "var(--blue)",
                    marginBottom: "1rem",
                  }}
                >
                  {n}
                </div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--ink-3)", lineHeight: 1.65 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Access Index explained ── */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "4rem 2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase" as const,
                color: "var(--blue)",
                marginBottom: "0.75rem",
              }}
            >
              The Access Index
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                marginBottom: "1rem",
                color: "var(--ink)",
              }}
            >
              One score. Five checkpoints.
            </h2>
            <p
              style={{
                fontSize: "0.92rem",
                color: "var(--ink-2)",
                lineHeight: 1.7,
                marginBottom: "1.5rem",
              }}
            >
              The Access Index combines reviewer ratings across five checkpoints into a single 0–100
              score. Recent reviews count more. Reviewers with a verified history are weighted
              higher.
            </p>
            <Link
              href="/search"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--blue)",
                color: "#fff",
                padding: "11px 22px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Start searching →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {BREAKDOWN_ITEMS.map(({ label, desc }, i) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.875rem 1rem",
                  background: "var(--surface)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "var(--blue-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: "var(--blue)",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          background: "var(--blue-soft)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "4rem 2rem",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            marginBottom: "0.75rem",
          }}
        >
          Ready to find places that work for you?
        </h2>
        <p style={{ fontSize: "0.95rem", color: "var(--ink-2)", marginBottom: "2rem" }}>
          No account needed to search. Sign up to save, review, and personalize.
        </p>
        <div
          style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const }}
        >
          <Link
            href="/search"
            style={{
              background: "var(--blue)",
              color: "#fff",
              padding: "13px 28px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.95rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Search venues
          </Link>
          <Link
            href="/profile"
            style={{
              background: "var(--bg)",
              color: "var(--ink)",
              border: "1.5px solid var(--border)",
              padding: "13px 28px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.95rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Set up my profile
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid var(--border)" }}
      >
        <p style={{ fontSize: "0.8rem", color: "var(--ink-3)" }}>
          © {new Date().getFullYear()} Accessana.{" "}
          <Link href="/map" style={{ color: "var(--blue)", textDecoration: "none" }}>
            Civic map
          </Link>
          {" · "}
          <a
            href="mailto:hello@accessana.com"
            style={{ color: "var(--blue)", textDecoration: "none" }}
          >
            Contact
          </a>
        </p>
      </footer>
    </main>
  );
}
