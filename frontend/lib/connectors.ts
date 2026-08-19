import { chunkDocument } from "./knowledge-engine.ts";

export const connectorTypes = ["google-drive", "sharepoint", "confluence", "notion", "github", "jira", "lms"] as const;
export type ConnectorType = typeof connectorTypes[number];

export interface SyncItem { externalId: string; title: string; content: string; version?: string; department?: string; url?: string }

export function normalizeConnectorItems(type: ConnectorType, items: SyncItem[]) {
  return items.filter(item => item.externalId && item.title && item.content.length >= 20).map(item => ({
    externalId: item.externalId,
    title: item.title.trim(),
    version: item.version || new Date().toISOString().slice(0, 10),
    department: item.department || ({ "google-drive": "Operations", sharepoint: "Operations", confluence: "Product", notion: "People", github: "Engineering", jira: "Product", lms: "People" }[type]),
    content: item.content.trim(),
    chunks: chunkDocument(item.content),
    sourceUrl: item.url || "",
  }));
}

export function validateConnectorConfig(type: ConnectorType, config: Record<string, string>) {
  const required: Record<ConnectorType, string[]> = { "google-drive": ["folderId"], sharepoint: ["siteUrl", "library"], confluence: ["spaceKey"], notion: ["databaseId"], github: ["repository"], jira: ["projectKey"], lms: ["baseUrl", "courseId"] };
  const missing = required[type].filter(key => !config[key]?.trim());
  return { valid: missing.length === 0, missing };
}
