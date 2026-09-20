import QRCode from "qrcode";

export type CredentialPayload = {
  registrationId: string;
  playerId: string;
  teamId: string;
  seasonId: string;
  leagueId: string;
};

export async function generatePlayerQrSvg(verificationUrl: string): Promise<string> {
  try {
    const svg = await QRCode.toString(verificationUrl, {
      type: "svg",
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return svg;
  } catch (err) {
    console.error("Error generating QR code:", err);
    return "";
  }
}

export async function generatePlayerQrDataUrl(verificationUrl: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 256,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return dataUrl;
  } catch (err) {
    console.error("Error generating QR data URL:", err);
    return "";
  }
}
