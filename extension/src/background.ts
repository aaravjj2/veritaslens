/// <reference types="chrome" />

declare const __API_BASE__: string;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "veritaslens-analyse",
    title: "Analyse with VeritasLens",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "veritaslens-analyse" || !tab?.id) return;
  const text = info.selectionText ?? "";
  chrome.storage.local.get(["veritasLensApiBase"], (items) => {
    const stored = items.veritasLensApiBase;
    const apiBase =
      typeof stored === "string" && stored.trim()
        ? stored.trim().replace(/\/$/, "")
        : __API_BASE__;
    chrome.tabs.sendMessage(tab.id!, {
      type: "VERITASLENS_ANALYSE",
      text,
      apiBase,
    });
  });
});
