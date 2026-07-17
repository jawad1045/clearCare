// lib/dropbox/namespace_header.ts
export function getClearCareNamespaceHeader(): string {
  const namespaceId = process.env.DROPBOX_CLEAR_CARE_NAMESPACE_ID;
  if (!namespaceId) {
    throw new Error("DROPBOX_CLEAR_CARE_NAMESPACE_ID is not configured.");
  }
  return JSON.stringify({
    ".tag": "namespace_id",
    namespace_id: namespaceId,
  });
}