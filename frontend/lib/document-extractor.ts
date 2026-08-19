import "server-only";

export async function extractDocumentText(file: File) {
  const name = file.name.toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (name.endsWith(".pdf")) {
    const { extractText } = await import("unpdf");
    const result = await extractText(bytes, { mergePages: true });
    return result.text.trim();
  }
  if (name.endsWith(".docx")) {
    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    return result.value.trim();
  }
  if (/\.(txt|md|csv|json)$/i.test(name) || file.type.startsWith("text/")) {
    return new TextDecoder().decode(bytes).trim();
  }
  throw new Error("Unsupported file. Upload PDF, DOCX, TXT, MD, CSV or JSON.");
}
