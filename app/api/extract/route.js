export const maxDuration = 30;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const mimeType = file.type || "application/pdf";

    if (mimeType === "text/plain") {
      const text = Buffer.from(bytes).toString("utf-8");
      return Response.json({ text });
    }

    const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
    const pdfData = await pdfParse(Buffer.from(bytes));
    const text = pdfData.text || "";

    if (!text.trim()) throw new Error("Could not extract text from PDF. Try a text-based PDF.");

    return Response.json({ text });
  } catch (err) {
    console.error("Extract error:", err);
    return Response.json({ error: err.message || "Extraction failed" }, { status: 500 });
  }
}