import "server-only";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

/**
 * Builds the downloadable final piece. Paragraphs are separated by blank
 * lines in the admin's text; single newlines are kept as line breaks.
 */

function paragraphs(body: string): string[][] {
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.split("\n").map((l) => l.trimEnd()))
    .filter((p) => p.some((l) => l.trim() !== ""));
}

/** Standard PDF fonts only cover Windows-1252; swap anything else for a close ASCII equivalent. */
function winAnsiSafe(text: string, font: PDFFont): string {
  const map: Record<string, string> = { "‑": "-", "−": "-", " ": " " };
  let out = "";
  for (const ch of text.normalize("NFC")) {
    const candidate = map[ch] ?? ch;
    try {
      font.encodeText(candidate);
      out += candidate;
    } catch {
      const stripped = candidate.normalize("NFD").replace(/[̀-ͯ]/g, "");
      try {
        font.encodeText(stripped);
        out += stripped;
      } catch {
        out += "?";
      }
    }
  }
  return out;
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export async function toPdf(title: string, body: string): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(title);
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  const pageSize: [number, number] = [612, 792]; // US Letter
  const margin = 72;
  const size = 13;
  const leading = size * 1.5;
  const maxWidth = pageSize[0] - margin * 2;

  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - margin;
  const ensureSpace = (h: number) => {
    if (y - h < margin) {
      page = pdf.addPage(pageSize);
      y = pageSize[1] - margin;
    }
  };

  for (const line of wrap(winAnsiSafe(title, bold), bold, 20, maxWidth)) {
    ensureSpace(28);
    page.drawText(line, { x: margin, y, size: 20, font: bold, color: rgb(0.17, 0.15, 0.13) });
    y -= 28;
  }
  y -= leading / 2;

  for (const para of paragraphs(body)) {
    for (const rawLine of para) {
      for (const line of wrap(winAnsiSafe(rawLine, font), font, size, maxWidth)) {
        ensureSpace(leading);
        page.drawText(line, { x: margin, y, size, font, color: rgb(0.17, 0.15, 0.13) });
        y -= leading;
      }
    }
    y -= leading / 2;
  }
  return Buffer.from(await pdf.save());
}

export async function toDocx(title: string, body: string): Promise<Buffer> {
  const doc = new Document({
    title,
    styles: { default: { document: { run: { font: "Georgia", size: 26 } } } },
    sections: [
      {
        children: [
          new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: title })] }),
          ...paragraphs(body).map(
            (lines) =>
              new Paragraph({
                spacing: { after: 240, line: 360 },
                children: lines.map((text, i) => new TextRun({ text, break: i > 0 ? 1 : undefined })),
              }),
          ),
        ],
      },
    ],
  });
  return Buffer.from(await Packer.toBuffer(doc));
}

export function documentFilename(serviceName: string, ext: "pdf" | "docx"): string {
  return `${serviceName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${ext}`;
}
