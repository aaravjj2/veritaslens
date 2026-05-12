"use client";

import { useCallback, useState } from "react";

export function ConnectExtensionClient() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mint = useCallback(async () => {
    setLoading(true);
    setError(null);
    setToken(null);
    try {
      const res = await fetch("/api/extension/token", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        token?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status})`);
        return;
      }
      if (typeof data.token === "string") {
        setToken(data.token);
        return;
      }
      setError("Unexpected response");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-white" data-testid="extension-connect-heading">
        Extension API token
      </h1>
      <p className="text-sm leading-relaxed text-slate-300">
        Sign in on the web, generate a short-lived token, then paste it into the
        VeritasLens browser extension so analyses from the panel are saved to
        your account.
      </p>
      <button
        type="button"
        onClick={() => void mint()}
        disabled={loading}
        className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
      >
        {loading ? "Generating…" : "Generate token"}
      </button>
      {error && (
        <p className="text-sm text-red-300" role="alert" data-testid="extension-token-error">
          {error}
        </p>
      )}
      {token && (
        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
            Token (keep private)
          </label>
          <textarea
            readOnly
            className="h-28 w-full rounded-lg border border-white/10 bg-slate-900 p-3 font-mono text-xs text-slate-100"
            value={token}
            data-testid="extension-token-value"
          />
          <p className="text-xs text-slate-400">
            Expires in 7 days. Regenerate anytime from this page.
          </p>
        </div>
      )}
    </div>
  );
}
