import { describe, expect, it } from "vitest";
import { parseCsvText } from "./csv-parser";
import { parseTeamCsv, generateSlug } from "./parse-team-csv";
import { parsePlayerCsv } from "./parse-player-csv";

describe("CSV Parser", () => {
  it("parses simple comma-separated values", () => {
    const csv = "name,color\nCruz Azul,#0000FF\nAmérica,#FFFF00";
    const rows = parseCsvText(csv);
    expect(rows).toEqual([
      ["name", "color"],
      ["Cruz Azul", "#0000FF"],
      ["América", "#FFFF00"],
    ]);
  });

  it("handles quotes with commas inside and escaped quotes", () => {
    const csv = 'name,notes\n"Club León, F.C.","Equipo con ""historia"""';
    const rows = parseCsvText(csv);
    expect(rows).toEqual([
      ["name", "notes"],
      ["Club León, F.C.", 'Equipo con "historia"'],
    ]);
  });

  it("ignores BOM character and carriage returns", () => {
    const csv = "\uFEFFheader1,header2\r\nval1,val2\r\n";
    const rows = parseCsvText(csv);
    expect(rows).toEqual([
      ["header1", "header2"],
      ["val1", "val2"],
    ]);
  });
});

describe("Team CSV Parser", () => {
  it("generates clean slugs properly", () => {
    expect(generateSlug("Atlético San Pancho")).toBe("atletico-san-pancho");
    expect(generateSlug("Deportivo Unión F.C.")).toBe("deportivo-union-f-c");
  });

  it("parses team CSV with Spanish headers and validates colors", () => {
    const csv = `nombre,fundacion,color_primario,color_secundario
Deportivo Perote,1998,#FF0000,#FFFFFF
Real Azteca,2010,00FF00,#000000`;

    const result = parseTeamCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({
      name: "Deportivo Perote",
      slug: "deportivo-perote",
      foundedYear: 1998,
      primaryColor: "#FF0000",
      secondaryColor: "#FFFFFF",
      status: "active",
    });
    expect(result.data[1].primaryColor).toBe("#00FF00");
  });

  it("reports error when required name column is missing or empty", () => {
    const csv = `fundacion,color_primario
1998,#FF0000`;
    const result = parseTeamCsv(csv);
    expect(result.errors[0].message).toContain("No se encontró la columna obligatoria");
  });

  it("flags duplicated slugs in CSV", () => {
    const csv = `nombre
Deportivo Perote
Deportivo Perote`;
    const result = parseTeamCsv(csv);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain("duplicado");
  });
});

describe("Player CSV Parser", () => {
  it("parses player rows and maps positions & foot correctly", () => {
    const csv = `nombre,apellidos,equipo,dorsal,posicion,pie_dominante
Carlos,Mendoza,Deportivo Perote,10,Delantero,Derecho
Luis,Gómez,Real Azteca,1,Portero,Zurdo`;

    const result = parsePlayerCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({
      firstName: "Carlos",
      lastName: "Mendoza",
      teamIdentifier: "Deportivo Perote",
      preferredNumber: 10,
      position: "forward",
      dominantFoot: "right",
      birthDate: undefined,
    });
    expect(result.data[1].position).toBe("goalkeeper");
    expect(result.data[1].dominantFoot).toBe("left");
  });

  it("handles full name column splitting", () => {
    const csv = `nombre_completo,dorsal
Juan Manuel Pérez,7`;

    const result = parsePlayerCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.data[0].firstName).toBe("Juan");
    expect(result.data[0].lastName).toBe("Manuel Pérez");
    expect(result.data[0].preferredNumber).toBe(7);
  });
});
