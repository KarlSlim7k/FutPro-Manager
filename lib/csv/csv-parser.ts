/**
 * RFC 4180 compliant lightweight CSV parser for FutPro Manager.
 * Supports quoted fields, escaped quotes, multiline values, and BOM removal.
 */

export type CsvParseResult<T> = {
  data: T[];
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  totalRows: number;
};

export function parseCsvText(rawText: string): string[][] {
  // Remove UTF-8 BOM if present
  const text = rawText.startsWith("\uFEFF") ? rawText.slice(1) : rawText;
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++; // skip \r\n
      }
      currentRow.push(currentField.trim());
      // Avoid pushing empty trailing lines
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}
