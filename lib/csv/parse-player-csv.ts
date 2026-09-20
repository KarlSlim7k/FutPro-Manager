import { parseCsvText, type CsvParseResult } from "./csv-parser";

export type ParsedPlayerRow = {
  firstName: string;
  lastName: string;
  teamIdentifier?: string;
  preferredNumber?: number;
  position?: "goalkeeper" | "defender" | "midfielder" | "forward";
  dominantFoot?: "left" | "right" | "both";
  birthDate?: string;
};

const POSITION_MAP: Record<string, "goalkeeper" | "defender" | "midfielder" | "forward"> = {
  portero: "goalkeeper",
  arquero: "goalkeeper",
  goalkeeper: "goalkeeper",
  por: "goalkeeper",
  gk: "goalkeeper",
  defensa: "defender",
  zaguero: "defender",
  defender: "defender",
  def: "defender",
  df: "defender",
  lateral: "defender",
  central: "defender",
  mediocampista: "midfielder",
  medio: "midfielder",
  volante: "midfielder",
  midfielder: "midfielder",
  med: "midfielder",
  mf: "midfielder",
  delantero: "forward",
  atacante: "forward",
  forward: "forward",
  del: "forward",
  fw: "forward",
  punta: "forward",
};

const FOOT_MAP: Record<string, "left" | "right" | "both"> = {
  derecho: "right",
  diestro: "right",
  right: "right",
  der: "right",
  izquierdo: "left",
  zurdo: "left",
  left: "left",
  izq: "left",
  ambidiestro: "both",
  ambos: "both",
  both: "both",
};

export function parsePlayerCsv(csvText: string): CsvParseResult<ParsedPlayerRow> {
  const rows = parseCsvText(csvText);
  if (rows.length === 0) {
    return { data: [], errors: [{ row: 0, message: "El archivo CSV está vacío." }], totalRows: 0 };
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((h) => h.toLowerCase().trim().replace(/[\s_-]+/g, ""));

  const firstNameIndex = headers.findIndex(
    (h) => h === "nombre" || h === "nombres" || h === "firstname"
  );
  const lastNameIndex = headers.findIndex(
    (h) => h === "apellidos" || h === "apellido" || h === "lastname"
  );
  const fullNameIndex = headers.findIndex(
    (h) => h === "nombrecompleto" || h === "jugador" || h === "fullname"
  );
  const teamIndex = headers.findIndex(
    (h) => h === "equipo" || h === "team" || h === "club" || h === "teamslug"
  );
  const numberIndex = headers.findIndex(
    (h) => h === "dorsal" || h === "numero" || h === "number" || h === "num"
  );
  const positionIndex = headers.findIndex((h) => h === "posicion" || h === "position" || h === "pos");
  const footIndex = headers.findIndex((h) => h === "pie" || h === "piedominante" || h === "dominantfoot");
  const birthDateIndex = headers.findIndex(
    (h) => h === "nacimiento" || h === "fechanacimiento" || h === "birthdate" || h === "fecha"
  );

  if (firstNameIndex === -1 && fullNameIndex === -1) {
    return {
      data: [],
      errors: [
        {
          row: 1,
          field: "nombre",
          message: "No se encontró la columna de nombre ('nombre' o 'nombrecompleto').",
        },
      ],
      totalRows: dataRows.length,
    };
  }

  const result: ParsedPlayerRow[] = [];
  const errors: Array<{ row: number; field?: string; message: string }> = [];

  dataRows.forEach((row, index) => {
    const rowNumber = index + 2;
    let firstName = "";
    let lastName = "";

    if (firstNameIndex !== -1) {
      firstName = row[firstNameIndex]?.trim() ?? "";
      lastName = lastNameIndex !== -1 ? row[lastNameIndex]?.trim() ?? "" : "";
    } else if (fullNameIndex !== -1) {
      const full = row[fullNameIndex]?.trim() ?? "";
      const parts = full.split(/\s+/);
      if (parts.length > 1) {
        firstName = parts[0];
        lastName = parts.slice(1).join(" ");
      } else {
        firstName = full;
        lastName = "-";
      }
    }

    if (!firstName || firstName.length < 2) {
      errors.push({
        row: rowNumber,
        field: "nombre",
        message: "El nombre del jugador es obligatorio y debe tener al menos 2 caracteres.",
      });
      return;
    }

    const teamIdentifier = teamIndex !== -1 ? row[teamIndex]?.trim() : undefined;

    let preferredNumber: number | undefined;
    if (numberIndex !== -1 && row[numberIndex]?.trim()) {
      const num = parseInt(row[numberIndex].trim(), 10);
      if (!isNaN(num) && num >= 1 && num <= 99) {
        preferredNumber = num;
      }
    }

    let position: "goalkeeper" | "defender" | "midfielder" | "forward" | undefined;
    if (positionIndex !== -1 && row[positionIndex]?.trim()) {
      const rawPos = row[positionIndex].trim().toLowerCase();
      position = POSITION_MAP[rawPos];
    }

    let dominantFoot: "left" | "right" | "both" | undefined;
    if (footIndex !== -1 && row[footIndex]?.trim()) {
      const rawFoot = row[footIndex].trim().toLowerCase();
      dominantFoot = FOOT_MAP[rawFoot];
    }

    let birthDate: string | undefined;
    if (birthDateIndex !== -1 && row[birthDateIndex]?.trim()) {
      const rawDate = row[birthDateIndex].trim();
      // Validate simple YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        birthDate = rawDate;
      }
    }

    result.push({
      firstName,
      lastName: lastName || "-",
      teamIdentifier,
      preferredNumber,
      position,
      dominantFoot,
      birthDate,
    });
  });

  return {
    data: result,
    errors,
    totalRows: dataRows.length,
  };
}
