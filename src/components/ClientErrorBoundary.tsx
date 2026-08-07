"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

/**
 * Catch render crashes so production shows a recoverable UI instead of
 * "Application error: a client-side exception has occurred".
 */
export class ClientErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Shelby] client error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "40vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something went wrong</h2>
          <p style={{ color: "#94a3b8", maxWidth: 420, fontSize: "0.875rem" }}>
            The page hit a client error (often Shelbynet/wallet network). Reload to continue.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              this.setState({ hasError: false, message: "" });
              window.location.href = "/reset";
            }}
          >
            Clear cache & reload
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              this.setState({ hasError: false, message: "" });
              window.location.reload();
            }}
          >
            Reload only
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
