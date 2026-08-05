import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last-resort render guard.
 *
 * The Synaptic Cartography canvas is already lazy-imported and wrapped in a
 * try/catch, so a WebGL failure can't take the page down. This boundary is
 * for everything else: a bad export, a null deref during render, a hook
 * misuse — anything that would otherwise leave a blank white page with no
 * clue about why. The fallback is dark on purpose so it never reads as a
 * "broken" white screen.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep it on the console so the actual failure is recoverable from
    // DevTools even though the UI stays usable.
    console.error("[error-boundary] render crashed", error, info);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#0a0a0a",
            color: "#e6e6e6",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto",
          }}
        >
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.1em", opacity: 0.6 }}>
            SOMETHING DIDN'T RENDER
          </p>
          <p style={{ marginTop: "1rem", maxWidth: "40rem", opacity: 0.85 }}>
            The page caught an error while mounting. Open the browser console
            (Cmd+Option+J) and refresh — if a red message is there, send it
            over and it can be fixed directly.
          </p>
          <pre
            style={{
              marginTop: "1.5rem",
              maxWidth: "60rem",
              overflow: "auto",
              fontSize: "0.75rem",
              textAlign: "left",
              whiteSpace: "pre-wrap",
              color: "#ff9d9d",
              opacity: 0.9,
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1.5rem",
              padding: "0.6rem 1.2rem",
              border: "1px solid #3d3f8f",
              borderRadius: "0.5rem",
              background: "#15151f",
              color: "#b7a6ff",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
