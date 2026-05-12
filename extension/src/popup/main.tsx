/// <reference types="chrome" />

import { StrictMode, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

declare const __API_BASE__: string;

const STORAGE_TOKEN_KEY = "veritasLensExtensionToken";

function Popup() {
  const [apiBase, setApiBase] = useState(__API_BASE__);
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get([STORAGE_TOKEN_KEY, "veritasLensApiBase"], (items) => {
      const t = items[STORAGE_TOKEN_KEY];
      if (typeof t === "string") setToken(t);
      const b = items.veritasLensApiBase;
      if (typeof b === "string" && b.trim()) setApiBase(b.trim().replace(/\/$/, ""));
    });
  }, []);

  const save = useCallback(() => {
    const base = apiBase.trim().replace(/\/$/, "");
    chrome.storage.local.set(
      {
        [STORAGE_TOKEN_KEY]: token.trim(),
        veritasLensApiBase: base,
      },
      () => {
        setSaved("Saved");
        setTimeout(() => setSaved(null), 2000);
      },
    );
  }, [apiBase, token]);

  const connectUrl = `${apiBase.replace(/\/$/, "")}/extension/connect`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: 320,
        padding: 4,
      }}
    >
      <strong>VeritasLens</strong>
      <span style={{ color: "#94a3b8", fontSize: 12 }}>
        Select text → right click → &quot;Analyse with VeritasLens&quot;.
      </span>
      <label style={{ fontSize: 11, color: "#94a3b8" }}>
        API base URL
        <input
          value={apiBase}
          onChange={(e) => setApiBase(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginTop: 4,
            padding: 6,
            borderRadius: 6,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e2e8f0",
            fontSize: 12,
          }}
        />
      </label>
      <label style={{ fontSize: 11, color: "#94a3b8" }}>
        Extension token (from web)
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={3}
          placeholder="Paste JWT after signing in on the web"
          style={{
            display: "block",
            width: "100%",
            marginTop: 4,
            padding: 6,
            borderRadius: 6,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e2e8f0",
            fontSize: 11,
            fontFamily: "monospace",
            resize: "vertical",
          }}
        />
      </label>
      <button
        type="button"
        onClick={() => void save()}
        style={{
          borderRadius: 8,
          border: "none",
          padding: "8px 10px",
          fontWeight: 600,
          background: "#6366f1",
          color: "white",
          cursor: "pointer",
          fontSize: 12,
        }}
      >
        Save token & API URL
      </button>
      {saved && (
        <span style={{ fontSize: 11, color: "#86efac" }} role="status">
          {saved}
        </span>
      )}
      <a
        href={connectUrl}
        target="_blank"
        rel="noreferrer"
        style={{ color: "#a5b4fc", fontSize: 12 }}
      >
        Open token page (sign in, then generate)
      </a>
      <a
        href={`${apiBase.replace(/\/$/, "")}/analyse`}
        target="_blank"
        rel="noreferrer"
        style={{ color: "#a5b4fc", fontSize: 12 }}
      >
        Open web analyser
      </a>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Popup />
    </StrictMode>,
  );
}
