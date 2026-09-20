import { describe, expect, it } from "vitest";
import { generatePlayerQrSvg, generatePlayerQrDataUrl } from "./player-id-token";

describe("Player Credential QR Generator", () => {
  it("generates a valid SVG QR code string containing svg tags and path elements", async () => {
    const url = "https://futpro-manager.local/credencial/reg-123456";
    const svg = await generatePlayerQrSvg(url);

    expect(svg).toBeDefined();
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("<path");
  });

  it("generates a valid data URL base64 image", async () => {
    const url = "https://futpro-manager.local/credencial/reg-123456";
    const dataUrl = await generatePlayerQrDataUrl(url);

    expect(dataUrl).toBeDefined();
    expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });
});
