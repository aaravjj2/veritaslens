import sourcesData from "./sources.json";

export type Source = {
  id: string;
  org_name: string;
  country: string;
  language: string;
  url: string;
  last_verified?: string;
};

export const sources: Source[] = sourcesData as Source[];

export function getSourceListForPrompt() {
  return sources.map((s) => ({
    id: s.id,
    name: s.org_name,
    country: s.country,
    url: s.url,
  }));
}

export function getAllowedSourceIds(): Set<string> {
  return new Set(sources.map((s) => s.id));
}

export function getSourceById(id: string): Source | undefined {
  return sources.find((s) => s.id === id);
}
