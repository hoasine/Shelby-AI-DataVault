"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

const TAGS = ["nlp","computer-vision","tabular","audio","code","multimodal","science","finance","medical","speech","3d","video","multilingual","instruction-tuning"];
const LICENSES = ["CC-BY-4.0","CC-BY-NC-4.0","CC-BY-NC-SA-4.0","CC0","MIT","Apache-2.0","Proprietary (single user)"];

const fmt = (b: number) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` :
  b < 1073741824 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1073741824).toFixed(1)} GB`;

type Template = {
  id: string;
  icon: string;
  title: string;
  tagline: string;
  name: string;
  description: string;
  file: string;
  format: string;
  tags: string[];
  license: string;
};

const TEMPLATES: Template[] = [
  {
    id: "instruction-tuning",
    icon: "◈",
    title: "Instruction Tuning",
    tagline: "Web3 & AI fine-tuning",
    name: "Blockchain & AI Instruction Dataset",
    description: "10 high-quality prompt–response pairs covering blockchain technology, smart contracts, cryptography, distributed systems, and machine learning. Formatted as JSONL with category labels. Ideal for fine-tuning LLMs on Web3 and decentralized technology domains.",
    file: "/templates/instruction-tuning.jsonl",
    format: "JSONL",
    tags: ["nlp", "instruction-tuning"],
    license: "CC-BY-4.0",
  },
  {
    id: "text-classification",
    icon: "≡",
    title: "Text Classification",
    tagline: "Tech review sentiment",
    name: "Web3 Tech Review Sentiment Dataset",
    description: "15 labeled tech review samples covering blockchain platforms, DeFi protocols, and AI tools. Includes positive, negative, and neutral sentiment classes with confidence scores. Suitable for training sentiment classifiers on crypto and tech product reviews.",
    file: "/templates/text-classification.csv",
    format: "CSV",
    tags: ["nlp", "tabular"],
    license: "CC-BY-4.0",
  },
  {
    id: "image-labels",
    icon: "⬡",
    title: "Image Labels Index",
    tagline: "Autonomous vehicle annotations",
    name: "Self-Driving Scene Classification Dataset",
    description: "15 annotated autonomous driving scene records with labels for vehicles, pedestrians, cyclists, traffic signs, and traffic lights. Includes confidence scores, train/val/test splits, and annotator IDs. Designed for training perception models in autonomous systems.",
    file: "/templates/image-labels.csv",
    format: "CSV",
    tags: ["computer-vision", "tabular"],
    license: "CC-BY-4.0",
  },
  {
    id: "code-completion",
    icon: "⌥",
    title: "Code Completion Pairs",
    tagline: "Crypto & Web3 code",
    name: "Web3 Developer Code Completion Dataset",
    description: "8 code completion pairs in Python and TypeScript for blockchain development: Merkle trees, wallet connections, cryptographic signatures, rate limiting, encryption, and data chunking. Includes difficulty tags for curriculum learning.",
    file: "/templates/code-completion.jsonl",
    format: "JSONL",
    tags: ["code", "nlp"],
    license: "MIT",
  },
  {
    id: "tabular-regression",
    icon: "▦",
    title: "Tabular Regression",
    tagline: "AI model performance",
    name: "LLM Training Performance Dataset",
    description: "15 records of large language model training runs with parameters: model size, training hours, dataset size, GPU count, batch size, learning rate, epochs, validation loss, inference speed, and accuracy score. Ideal for predicting model performance from hyperparameters.",
    file: "/templates/tabular-regression.csv",
    format: "CSV",
    tags: ["tabular", "science"],
    license: "CC-BY-4.0",
  },
  {
    id: "named-entity-recognition",
    icon: "⊞",
    title: "Named Entity Recognition",
    tagline: "Crypto & tech NER",
    name: "Web3 News Named Entity Dataset",
    description: "8 annotated sentences from crypto and AI news in BIO format. Covers entities: PER (founders/CEOs), ORG (companies/protocols), LOC (cities), DATE, MONEY, PERCENT, PRODUCT (tokens/models), EVENT, and TIME. Compatible with Hugging Face and spaCy.",
    file: "/templates/named-entity-recognition.jsonl",
    format: "JSONL",
    tags: ["nlp"],
    license: "CC-BY-4.0",
  },
  {
    id: "time-series",
    icon: "∿",
    title: "Time Series Forecasting",
    tagline: "Token price analytics",
    name: "Crypto Token Price Time Series",
    description: "15 hourly token price observations with rolling mean/std, temporal features (hour, day, weekend), trading volume, market cap, and anomaly labels. One price spike anomaly included. Suitable for LSTM, transformer, or gradient boosting price prediction models.",
    file: "/templates/time-series.csv",
    format: "CSV",
    tags: ["tabular", "finance"],
    license: "CC-BY-4.0",
  },
];

type Step = "path" | "templates" | "form" | "uploading" | "confirming" | "done";

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label style={{ display: "block", marginBottom: "8px" }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6875rem",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
        }}
      >
        {children}
      </span>
      {hint && (
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginLeft: "8px",
          }}
        >
          {hint}
        </span>
      )}
    </label>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const { account, signAndSubmitTransaction } = useWallet();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step,          setStep]          = useState<Step>("path");
  const [statusMsg,     setStatusMsg]     = useState("");
  const [statusDetail,  setStatusDetail]  = useState("");
  const [dragOver,      setDragOver]      = useState(false);
  const [file,          setFile]          = useState<File | null>(null);
  const [name,          setName]          = useState("");
  const [description,   setDescription]   = useState("");
  const [price,         setPrice]         = useState("");
  const [tags,          setTags]          = useState<string[]>([]);
  const [license,       setLicense]       = useState(LICENSES[0]);
  const [error,         setError]         = useState<string | null>(null);
  const [txHash,        setTxHash]        = useState<string | null>(null);
  const [loadingTpl,    setLoadingTpl]    = useState<string | null>(null);

  const toggleTag = (t: string) => setTags((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const resetForm = () => {
    setStep("path"); setFile(null); setName(""); setDescription("");
    setPrice(""); setTags([]); setLicense(LICENSES[0]); setTxHash(null); setError(null);
  };

  const selectTemplate = async (tpl: Template) => {
    setLoadingTpl(tpl.id);
    try {
      const res = await fetch(tpl.file);
      if (!res.ok) throw new Error("Could not load template file");
      const blob = await res.blob();
      const filename = tpl.file.split("/").pop()!;
      const tplFile = new File([blob], filename, { type: blob.type || "text/plain" });
      setFile(tplFile);
      setName(tpl.name);
      setDescription(tpl.description);
      setTags(tpl.tags);
      setLicense(tpl.license);
      setStep("form");
    } catch {
      setError("Failed to load template. Please try again.");
    } finally {
      setLoadingTpl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account)           { setError("Connect your wallet first."); return; }
    if (!file)              { setError("Select a dataset file."); return; }
    if (!name.trim())       { setError("Dataset name is required."); return; }
    if (!description.trim()){ setError("Description is required."); return; }
    if (tags.length === 0)  { setError("Select at least one tag."); return; }
    setError(null);

    const sellerAddress = account.address.toString();
    const priceOctas = !price || price === "0" ? 0 : Math.round(parseFloat(price) * 1e8);

    try {
      setStep("uploading");
      setStatusMsg("Uploading to decentralized storage");
      setStatusDetail("Your file is being encoded and distributed across Shelby Protocol nodes.");

      const form = new FormData();
      form.append("file", file);
      form.append("sellerAddress", sellerAddress);

      const uploadRes = await fetch("/api/datasets/upload", { method: "POST", body: form });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error ?? "Upload failed");
      }
      const { shelbyBlobName, commitmentBytes, blobSize } = await uploadRes.json();

      setStep("confirming");
      setStatusMsg("Confirm transaction in wallet");
      setStatusDetail("Sign the transaction to register your dataset on the blockchain.");

      const res = await signAndSubmitTransaction({
        data: {
          function: `${MODULE_ADDRESS}::dataset_registry::register_dataset` as `${string}::${string}::${string}`,
          typeArguments: [],
          functionArguments: [name.trim(), description.trim(), shelbyBlobName, commitmentBytes, blobSize, priceOctas, tags, license],
        },
      });

      setTxHash(res.hash);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setStep("form");
    }
  };

  const isProcessing = step === "uploading" || step === "confirming";

  // ── Done state ──
  if (step === "done") {
    return (
      <div>
        <div style={{ maxWidth: "540px", margin: "4rem auto", padding: "0 var(--container-padding)", textAlign: "center" }}>
          {/* Success icon */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              background: "var(--success-dim)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              margin: "0 auto 2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--success)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "2rem",
              color: "var(--text-primary)",
              marginBottom: "0.75rem",
              letterSpacing: "-0.02em",
            }}
          >
            Dataset Listed Successfully
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            <strong style={{ color: "var(--text-primary)" }}>{name}</strong> is now available on the marketplace.
            Buyers can discover and purchase it using their Aptos wallet.
          </p>

          {txHash && (
            <div
              className="surface"
              style={{
                padding: "1rem 1.25rem",
                marginBottom: "2rem",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.625rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Transaction Hash
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--accent-primary)",
                  wordBreak: "break-all",
                }}
              >
                {txHash}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={() => router.push("/")} className="btn-primary">
              View Marketplace
            </button>
            <button onClick={resetForm} className="btn-secondary">
              List Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          maxWidth: step === "templates" ? "1100px" : "720px",
          margin: "0 auto",
          padding: "0 0 3rem",
          transition: "max-width 0.2s ease",
        }}
      >
        {/* Page header */}
        <div style={{ marginBottom: "2rem" }}>
          {/* Breadcrumb */}
          {(step === "templates" || step === "form") && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                color: "var(--text-muted)",
                marginBottom: "1rem",
              }}
            >
              <button
                onClick={resetForm}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-tertiary)",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "inherit",
                  fontSize: "inherit",
                }}
              >
                Choose Method
              </button>
              <span style={{ color: "var(--border-default)" }}>/</span>
              {step === "form" ? (
                <>
                  <button
                    onClick={() => setStep("templates")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-tertiary)",
                      cursor: "pointer",
                      padding: 0,
                      fontFamily: "inherit",
                      fontSize: "inherit",
                    }}
                  >
                    Templates
                  </button>
                  <span style={{ color: "var(--border-default)" }}>/</span>
                  <span style={{ color: "var(--text-secondary)" }}>Details</span>
                </>
              ) : (
                <span style={{ color: "var(--text-secondary)" }}>Templates</span>
              )}
            </div>
          )}

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "0.5rem",
            }}
          >
            List a Dataset
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              color: "var(--text-tertiary)",
              maxWidth: "560px",
            }}
          >
            Your dataset will be stored on{" "}
            <a
              href="https://shelby.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent-primary)", textDecoration: "none" }}
            >
              Shelby Protocol
            </a>
            {" "}with cryptographic integrity guarantees, and registered on Aptos blockchain for ownership verification.
          </p>
        </div>

        {/* ── Step: Path selection ── */}
        {step === "path" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {/* Upload own */}
            <button
              onClick={() => setStep("form")}
              className="glass-card"
              style={{
                all: "unset",
                cursor: "pointer",
                display: "block",
              }}
            >
              <div
                style={{
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  height: "100%",
                  boxSizing: "border-box",
                  minHeight: "200px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "var(--accent-dim)",
                    border: "1px solid rgba(0, 212, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "1.125rem",
                      color: "var(--text-primary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Upload Your Dataset
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.875rem",
                      color: "var(--text-tertiary)",
                      lineHeight: 1.5,
                    }}
                  >
                    Upload any file format — CSV, JSONL, Parquet, ZIP, or custom.
                    Set your own pricing and metadata.
                  </p>
                </div>
                <div
                  style={{
                    marginTop: "auto",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6875rem",
                    color: "var(--accent-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Start from scratch →
                </div>
              </div>
            </button>

            {/* Templates */}
            <button
              onClick={() => setStep("templates")}
              className="glass-card"
              style={{
                all: "unset",
                cursor: "pointer",
                display: "block",
              }}
            >
              <div
                style={{
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  height: "100%",
                  boxSizing: "border-box",
                  minHeight: "200px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(168, 85, 247, 0.1)",
                    border: "1px solid rgba(168, 85, 247, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "1.125rem",
                      color: "var(--text-primary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Use a Template
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.875rem",
                      color: "var(--text-tertiary)",
                      lineHeight: 1.5,
                    }}
                  >
                    Choose from {TEMPLATES.length} pre-configured dataset templates.
                    Edit all fields before listing.
                  </p>
                </div>
                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  {TEMPLATES.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      style={{
                        padding: "3px 8px",
                        background: "var(--surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "4px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.5625rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      {t.format}
                    </span>
                  ))}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.625rem",
                      color: "#a855f7",
                      alignSelf: "center",
                    }}
                  >
                    +{TEMPLATES.length - 3} more
                  </span>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ── Step: Template picker ── */}
        {step === "templates" && (
          <div>
            {error && (
              <div
                style={{
                  padding: "0.875rem 1rem",
                  marginBottom: "1.5rem",
                  background: "var(--error-dim)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  borderRadius: "8px",
                  color: "var(--error)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1rem",
              }}
            >
              {TEMPLATES.map((tpl) => {
                const loading = loadingTpl === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => selectTemplate(tpl)}
                    disabled={loadingTpl !== null}
                    className="glass-card"
                    style={{
                      all: "unset",
                      cursor: loadingTpl ? "wait" : "pointer",
                      display: "block",
                      opacity: loadingTpl && !loading ? 0.5 : 1,
                    }}
                  >
                    <div
                      style={{
                        padding: "1.25rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                        height: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      {/* Icon + format */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "1.25rem",
                            color: "var(--accent-primary)",
                          }}
                        >
                          {tpl.icon}
                        </span>
                        <span
                          style={{
                            padding: "3px 8px",
                            background: "var(--surface)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "4px",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.5625rem",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                          }}
                        >
                          {tpl.format}
                        </span>
                      </div>

                      {/* Title + tagline */}
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: "var(--text-primary)",
                            marginBottom: "4px",
                          }}
                        >
                          {tpl.title}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {tpl.tagline}
                        </div>
                      </div>

                      {/* Description */}
                      <p
                        className="line-clamp-3"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.8125rem",
                          color: "var(--text-tertiary)",
                          lineHeight: 1.5,
                          flex: 1,
                        }}
                      >
                        {tpl.description}
                      </p>

                      {/* CTA */}
                      <div
                        style={{
                          borderTop: "1px solid var(--border-subtle)",
                          paddingTop: "0.75rem",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6875rem",
                          color: loading ? "var(--accent-primary)" : "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {loading ? (
                          <>
                            <span style={{ display: "inline-block", animation: "spin 0.9s linear infinite" }}>◌</span>
                            Loading...
                          </>
                        ) : (
                          "Use template →"
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step: Form ── */}
        {(step === "form" || isProcessing) && (
          <>
            {/* Template notice */}
            {file && name && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  marginBottom: "1.5rem",
                  background: "var(--success-dim)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--success)" }}>
                  Template loaded — all fields are editable before listing.
                </span>
              </div>
            )}

            {/* Progress indicator */}
            {isProcessing && (
              <div
                className="surface"
                style={{
                  padding: "1.25rem 1.5rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "2px solid var(--border-default)",
                    borderTopColor: "var(--accent-primary)",
                    flexShrink: 0,
                    animation: "spin 0.85s linear infinite",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "2px",
                    }}
                  >
                    {statusMsg}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
                    {statusDetail}
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: "0.875rem 1rem",
                  marginBottom: "1.5rem",
                  background: "var(--error-dim)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  borderRadius: "8px",
                  color: "var(--error)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
              {/* File drop zone */}
              <div>
                <FieldLabel>Dataset File</FieldLabel>
                <div
                  onClick={() => !isProcessing && fileRef.current?.click()}
                  onDrop={onDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  style={{
                    padding: "2.5rem",
                    border: dragOver ? "2px dashed var(--accent-primary)" : file ? "1px solid var(--border-default)" : "2px dashed var(--border-default)",
                    background: dragOver ? "var(--accent-dim)" : file ? "var(--bg-card)" : "transparent",
                    borderRadius: "12px",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    textAlign: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  <input ref={fileRef} type="file" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} disabled={isProcessing} />
                  {file ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "var(--surface)",
                          border: "1px solid var(--border-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                          <polyline points="13 2 13 9 20 9" />
                        </svg>
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "0.9375rem", color: "var(--text-primary)", marginBottom: "2px" }}>{file.name}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-muted)" }}>{fmt(file.size)}</div>
                      </div>
                      {!isProcessing && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            padding: "6px 8px",
                            marginLeft: "auto",
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          background: "var(--surface)",
                          border: "1px solid var(--border-subtle)",
                          margin: "0 auto 1rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                        Drop your file here or click to browse
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                        Supports any file format
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <FieldLabel>Dataset Name</FieldLabel>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. GPT-4 Instruction Tuning Dataset"
                  disabled={isProcessing}
                  className="field-input"
                />
              </div>

              {/* Description */}
              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the dataset contents, source, quality, and intended use cases..."
                  disabled={isProcessing}
                  rows={4}
                  className="field-input"
                />
              </div>

              {/* Price */}
              <div>
                <FieldLabel hint="Leave blank or 0 for free">Price (APT)</FieldLabel>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    disabled={isProcessing}
                    className="field-input"
                    style={{ paddingRight: "3.5rem" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      pointerEvents: "none",
                    }}
                  >
                    APT
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <FieldLabel hint="Select all that apply">Category Tags</FieldLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {TAGS.map((t) => {
                    const active = tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={isProcessing}
                        onClick={() => toggleTag(t)}
                        style={{
                          padding: "8px 14px",
                          border: active ? "1px solid var(--accent-primary)" : "1px solid var(--border-default)",
                          background: active ? "var(--accent-dim)" : "transparent",
                          color: active ? "var(--accent-primary)" : "var(--text-tertiary)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6875rem",
                          fontWeight: 500,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          cursor: isProcessing ? "not-allowed" : "pointer",
                          borderRadius: "6px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* License */}
              <div>
                <FieldLabel>License</FieldLabel>
                <select value={license} onChange={(e) => setLicense(e.target.value)} disabled={isProcessing} className="field-input">
                  {LICENSES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Submit */}
              <div style={{ paddingTop: "0.5rem" }}>
                <button
                  type="submit"
                  disabled={isProcessing || !account}
                  className={!account || isProcessing ? "btn-secondary" : "btn-primary"}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    opacity: isProcessing || !account ? 0.6 : 1,
                    cursor: isProcessing || !account ? "not-allowed" : "pointer",
                  }}
                >
                  {!account
                    ? "Connect Wallet to Continue"
                    : isProcessing
                      ? (
                          <>
                            <span style={{ display: "inline-block", animation: "spin 0.9s linear infinite" }}>◌</span>
                            {statusMsg || "Processing..."}
                          </>
                        )
                      : "List Dataset on Marketplace"
                  }
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
