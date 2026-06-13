export function parseAttachment(stored: string, index: number): { name: string; url: string } {
  try {
    const p = JSON.parse(stored);
    if (p && typeof p.n === "string" && typeof p.u === "string") {
      return { name: p.n, url: p.u };
    }
  } catch {}
  return { name: `Attachment ${index + 1}`, url: stored };
}

export function encodeAttachment(name: string, url: string): string {
  return JSON.stringify({ n: name, u: url });
}
