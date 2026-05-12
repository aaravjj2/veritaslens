/// <reference types="chrome" />

type Msg = {
  type: "VERITASLENS_ANALYSE";
  text: string;
  apiBase: string;
};

chrome.runtime.onMessage.addListener((message: Msg) => {
  if (message.type !== "VERITASLENS_ANALYSE") return;
  injectPanel(message.text, message.apiBase);
});

function injectPanel(text: string, apiBase: string) {
  const existing = document.getElementById("veritaslens-root");
  if (existing) existing.remove();

  const root = document.createElement("div");
  root.id = "veritaslens-root";
  Object.assign(root.style, {
    position: "fixed",
    top: "0",
    right: "0",
    height: "100vh",
    width: "min(420px, 100vw)",
    zIndex: "2147483646",
    boxShadow: "-8px 0 30px rgba(0,0,0,0.45)",
    pointerEvents: "auto",
  } as CSSStyleDeclaration);

  const close = document.createElement("button");
  close.textContent = "×";
  Object.assign(close.style, {
    position: "absolute",
    top: "8px",
    right: "12px",
    zIndex: "2147483647",
    border: "none",
    background: "rgba(15,23,42,0.9)",
    color: "#e5e7eb",
    borderRadius: "999px",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "18px",
  } as CSSStyleDeclaration);
  close.addEventListener("click", () => root.remove());

  const iframe = document.createElement("iframe");
  const url = new URL(chrome.runtime.getURL("panel.html"));
  url.searchParams.set("text", text);
  url.searchParams.set("apiBase", apiBase);
  iframe.src = url.toString();
  Object.assign(iframe.style, {
    border: "0",
    width: "100%",
    height: "100%",
    background: "#020617",
  } as CSSStyleDeclaration);

  root.appendChild(close);
  root.appendChild(iframe);
  document.documentElement.appendChild(root);
}
