import { parseCsvText, type CsvParseResult } from "./csv-parser";

export type ParsedTeamRow = {
  name: string;
  slug: string;
  primaryColor?: string;
  secondaryColor?: string;
  foundedYear?: number;
  status: "active" | "inactive" | "archived";
};

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function parseTeamCsv(csvText: string): CsvParseResult<ParsedTeamRow> {
  const rows = parseCsvText(csvText);
  if (rows.length === 0) {
    return { data: [], errors: [{ row: 0, message: "El archivo CSV está vacío." }], totalRows: 0 };
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((h) => h.toLowerCase().trim().replace(/[\s_-]+/g, ""));

  const nameIndex = headers.findIndex((h) => h === "nombre" || h === "name" || h === "equipo");
  const slugIndex = headers.findIndex((h) => h === "slug" || h === "identificador");
  const primaryColorIndex = headers.findIndex(
    (h) => h === "colorprimario" || h === "color1" || h === "primarycolor"
  );
  const secondaryColorIndex = headers.findIndex(
    (h) => h === "colorsecundario" || h === "color2" || h === "secondarycolor"
  );
  const foundedYearIndex = headers.findIndex(
    (h) => h === "fundacion" || h === "ano" || h === "foundedyear" || h === "anio"
  );
  const statusIndex = headers.findIndex((h) => h === "estado" || h === "status");

  if (nameIndex === -1) {
    return {
      data: [],
      errors: [
        {
          row: 1,
          field: "nombre",
          message: "No se encontró la columna obligatoria 'nombre' o 'equipo'.",
        },
      ],
      totalRows: dataRows.length,
    };
  }

  const result: ParsedTeamRow[] = [];
  const errors: Array<{ row: number; field?: string; message: string }> = [];
  const seenSlugs = new Set<string>();

  dataRows.forEach((row, index) => {
    const rowNumber = index + 2; // header is 1
    const name = row[nameIndex]?.trim();

    if (!name || name.length < 2) {
      errors.push({
        row: rowNumber,
        field: "nombre",
        message: "El nombre del equipo es obligatorio y debe tener al menos 2 caracteres.",
      });
      return;
    }

    let slug = slugIndex !== -1 && row[slugIndex]?.trim() ? row[slugIndex].trim() : generateSlug(name);
    if (!slug) {
      slug = `equipo-${rowNumber}`;
    }

    if (seenSlugs.has(slug)) {
      errors.push({
        row: rowNumber,
        field: "slug",
        message: `El slug '${slug}' está duplicado en el archivo.`,
      });
      return;
    }
    seenSlugs.add(slug);

    let primaryColor: string | undefined;
    if (primaryColorIndex !== -1 && row[primaryColorIndex]?.trim()) {
      const color = row[primaryColorIndex].trim();
      const formatted = color.startsWith("#") ? color : `#${color}`;
      if (HEX_COLOR_PATTERN.test(formatted)) {
        primaryColor = formatted;
      }
    }

    let secondaryColor: string | undefined;
    if (secondaryColorIndex !== -1 && row[secondaryColorIndex]?.trim()) {
      const color = row[secondaryColorIndex].trim();
      const formatted = color.startsWith("#") ? color : `#${color}`;
      if (HEX_COLOR_PATTERN.test(formatted)) {
        secondaryColor = formatted;
      }
    }

    let foundedYear: number | undefined;
    if (foundedYearIndex !== -1 && row[foundedYearIndex]?.trim()) {
      const year = parseInt(row[foundedYearIndex].trim(), 10);
      const currentYear = new Date().getFullYear();
      if (!isNaN(year) && year >= 1850 && year <= currentYear) {
        foundedYear = year;
      }
    }

    let status: "active" | "inactive" | "archived" = "active";
    if (statusIndex !== -1 && row[statusIndex]?.trim()) {
      const s = row[statusIndex].trim().toLowerCase();
      if (s === "inactive" || s === "inactivo") status = "inactive";
      else if (s === "archived" || s === "archivado") status = "archived";
    }

    result.push({
      name,
      slug,
      primaryColor,
      secondaryColor,
      foundedYear,
      status,
    });
  });

  return {
    data: result,
    errors,
    totalRows: dataRows.length,
  };
}
