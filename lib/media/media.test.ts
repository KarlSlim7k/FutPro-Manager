import { describe, expect, it } from "vitest";
import { resolveCdnMediaUrl, sanitizeFileName } from "./upload-media";
import { getInitialCropBox, ASPECT_RATIOS } from "./image-processor";

describe("lib/media/upload-media", () => {
  it("sanitizes file names correctly", () => {
    expect(sanitizeFileName("Mi Foto De Perfil 2026.PNG")).toBe("mi-foto-de-perfil-2026.png");
    expect(sanitizeFileName("archivo@@##$$con!!caracteres.jpg")).toBe("archivo-con-caracteres.jpg");
    expect(sanitizeFileName("---espacios---multiples---.webp")).toBe("espacios-multiples.webp");
    expect(sanitizeFileName("")).toBe("file");
  });

  it("returns empty string for empty url in resolveCdnMediaUrl", () => {
    expect(resolveCdnMediaUrl(null)).toBe("");
    expect(resolveCdnMediaUrl(undefined)).toBe("");
    expect(resolveCdnMediaUrl("")).toBe("");
  });

  it("resolves regular storage url without transformations when none specified", () => {
    const url = "https://wyntbcsgnbpznimcixqb.supabase.co/storage/v1/object/public/league-media/leagues/1/logo.png";
    expect(resolveCdnMediaUrl(url)).toBe(url);
  });

  it("transforms supabase storage url with image optimization options", () => {
    const url = "https://wyntbcsgnbpznimcixqb.supabase.co/storage/v1/object/public/league-media/leagues/1/logo.png";
    const transformed = resolveCdnMediaUrl(url, { width: 300, height: 300, resize: "cover", quality: 85 });

    expect(transformed).toContain("/storage/v1/render/image/public/league-media/leagues/1/logo.png");
    expect(transformed).toContain("width=300");
    expect(transformed).toContain("height=300");
    expect(transformed).toContain("resize=cover");
    expect(transformed).toContain("quality=85");
  });
});

describe("lib/media/image-processor", () => {
  it("calculates square 1:1 crop box centered for landscape image", () => {
    // 1000 x 500 landscape -> crop should be 500 x 500, centered horizontally
    const crop = getInitialCropBox(1000, 500, "square");
    expect(crop.width).toBe(500);
    expect(crop.height).toBe(500);
    expect(crop.x).toBe(250);
    expect(crop.y).toBe(0);
  });

  it("calculates square 1:1 crop box centered for portrait image", () => {
    // 400 x 800 portrait -> crop should be 400 x 400, centered vertically
    const crop = getInitialCropBox(400, 800, "square");
    expect(crop.width).toBe(400);
    expect(crop.height).toBe(400);
    expect(crop.x).toBe(0);
    expect(crop.y).toBe(200);
  });

  it("calculates portrait 3:4 crop box centered", () => {
    const crop = getInitialCropBox(800, 800, "portrait");
    const targetRatio = ASPECT_RATIOS.portrait!; // 0.75
    expect(crop.height).toBe(800);
    expect(crop.width).toBe(Math.round(800 * targetRatio)); // 600
    expect(crop.x).toBe(100);
    expect(crop.y).toBe(0);
  });

  it("returns full image box when free/null aspect ratio is used", () => {
    const crop = getInitialCropBox(1920, 1080, "free");
    expect(crop.width).toBe(1920);
    expect(crop.height).toBe(1080);
    expect(crop.x).toBe(0);
    expect(crop.y).toBe(0);
  });
});
