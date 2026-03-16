"use client";

import Link from "next/link";

export interface Dataset {
  id: string;
  datasetAddr: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  size: string;
  downloads: number;
  seller: string;
}

const TAG_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "nlp":               { bg: "rgba(99, 102, 241, 0.12)", border: "rgba(99, 102, 241, 0.25)", text: "#a5b4fc" },
  "computer-vision":   { bg: "rgba(236, 72, 153, 0.12)", border: "rgba(236, 72, 153, 0.25)", text: "#f9a8d4" },
  "tabular":           { bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.25)", text: "#6ee7b7" },
  "audio":             { bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.25)", text: "#fcd34d" },
  "code":              { bg: "rgba(0, 212, 255, 0.12)",  border: "rgba(0, 212, 255, 0.25)",  text: "#67e8f9" },
  "multimodal":        { bg: "rgba(168, 85, 247, 0.12)", border: "rgba(168, 85, 247, 0.25)", text: "#c4b5fd" },
  "science":           { bg: "rgba(34, 197, 94, 0.12)",  border: "rgba(34, 197, 94, 0.25)",  text: "#86efac" },
  "finance":           { bg: "rgba(251, 191, 36, 0.12)", border: "rgba(251, 191, 36, 0.25)", text: "#fde047" },
  "medical":           { bg: "rgba(244, 63, 94, 0.12)",  border: "rgba(244, 63, 94, 0.25)",  text: "#fda4af" },
  "speech":            { bg: "rgba(249, 115, 22, 0.12)", border: "rgba(249, 115, 22, 0.25)", text: "#fdba74" },
  "3d":                { bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.25)", text: "#93c5fd" },
  "video":             { bg: "rgba(139, 92, 246, 0.12)", border: "rgba(139, 92, 246, 0.25)", text: "#c4b5fd" },
  "multilingual":      { bg: "rgba(20, 184, 166, 0.12)", border: "rgba(20, 184, 166, 0.25)", text: "#5eead4" },
  "instruction-tuning":{ bg: "rgba(236, 72, 153, 0.12)", border: "rgba(236, 72, 153, 0.25)", text: "#f9a8d4" },
};

function TagBadge({ tag }: { tag: string }) {
  const colors = TAG_COLORS[tag] ?? { bg: "var(--surface)", border: "var(--border-subtle)", text: "var(--text-secondary)" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 8px",
        fontSize: "0.625rem",
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: "4px",
        whiteSpace: "nowrap",
      }}
    >
      {tag}
    </span>
  );
}

export function DatasetCard({ dataset, index }: { dataset: Dataset; index: number }) {
  const stagger = `stagger-${Math.min(index + 1, 10)}`;

  return (
    <Link href={`/datasets/${dataset.datasetAddr}`} style={{ display: "block", textDecoration: "none" }}>
      <div
        className={`glass-card glass-card-accent animate-fade-up ${stagger}`}
        style={{
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.875rem",
          height: "100%",
          minHeight: "220px",
        }}
      >
        {/* Top row: ID + Downloads */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.625rem",
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
              fontWeight: 500,
            }}
          >
            #{String(index + 1).padStart(4, "0")}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              color: "var(--text-tertiary)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {dataset.downloads.toLocaleString("en-US")}
          </div>
        </div>

        {/* Tags */}
        {dataset.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {dataset.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
            {dataset.tags.length > 3 && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.625rem",
                  color: "var(--text-muted)",
                  alignSelf: "center",
                }}
              >
                +{dataset.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3
          className="line-clamp-2"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "1rem",
            color: "var(--text-primary)",
            lineHeight: 1.4,
            letterSpacing: "-0.01em",
          }}
        >
          {dataset.name}
        </h3>

        {/* Description */}
        <p
          className="line-clamp-2"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            color: "var(--text-tertiary)",
            lineHeight: 1.55,
            flex: 1,
          }}
        >
          {dataset.description || "No description provided."}
        </p>

        {/* Footer: Size + Price */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--border-subtle)",
            marginTop: "auto",
          }}
        >
          {/* Size */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              color: "var(--text-tertiary)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
            {dataset.size}
          </div>

          {/* Price */}
          {dataset.price === 0 ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 10px",
                background: "var(--success-dim)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: "6px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "var(--success)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Free
            </span>
          ) : (
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  background: "var(--gradient-accent)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {dataset.price % 1 === 0 ? dataset.price.toFixed(0) : dataset.price.toFixed(2)}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.625rem",
                  fontWeight: 500,
                  color: "var(--text-muted)",
                }}
              >
                APT
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
