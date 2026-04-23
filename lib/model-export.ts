import { RoughRunwayModel, ExportedModel } from "./types";
import { compressToBase64, decompressFromBase64 } from "lz-string";

export function exportModel(model: RoughRunwayModel): string {
  const exportData: ExportedModel = {
    format: "roughrunway",
    version: 1,
    exportedAt: new Date().toISOString(),
    model: structuredClone(model)
  };

  const jsonString = JSON.stringify(exportData);
  return compressToBase64(jsonString);
}

export function exportModelJson(model: RoughRunwayModel): string {
  const exportData: ExportedModel = {
    format: "roughrunway",
    version: 1,
    exportedAt: new Date().toISOString(),
    model: structuredClone(model)
  };
  return JSON.stringify(exportData, null, 2);
}

export function importModel(compressedData: string): RoughRunwayModel | null {
  try {
    const jsonString = decompressFromBase64(compressedData);
    if (!jsonString) return null;

    const exportData: ExportedModel = JSON.parse(jsonString);

    // Validate the format
    if (exportData.format !== "roughrunway") {
      throw new Error("Invalid format");
    }

    return exportData.model;
  } catch (error) {
    console.error("Failed to import model:", error);
    return null;
  }
}

export function importModelFromJson(jsonText: string): RoughRunwayModel | null {
  try {
    const exportData: ExportedModel = JSON.parse(jsonText);
    if (exportData.format !== "roughrunway") throw new Error("Invalid format");
    return exportData.model;
  } catch (error) {
    console.error("Failed to import JSON model:", error);
    return null;
  }
}

export function parseShareableUrl(url: string): RoughRunwayModel | null {
  try {
    const hash = url.includes("#") ? url.split("#")[1] : url;
    const match = hash.match(/(?:^|&)model=([^&]+)/);
    if (!match) return null;
    return importModel(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function generateShareableUrl(model: RoughRunwayModel): string {
  const compressed = exportModel(model);
  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : "https://roughrunway.com";
  return `${baseUrl}/dashboard#model=${compressed}`;
}