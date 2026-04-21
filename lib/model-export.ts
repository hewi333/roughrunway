import { RoughRunwayModel, ExportedModel } from "@/lib/types";
import { LZString } from "lz-string";

export function exportModel(model: RoughRunwayModel): string {
  const exportData: ExportedModel = {
    format: "roughrunway",
    version: 1,
    exportedAt: new Date().toISOString(),
    model: structuredClone(model)
  };
  
  const jsonString = JSON.stringify(exportData);
  return LZString.compressToBase64(jsonString);
}

export function importModel(compressedData: string): RoughRunwayModel | null {
  try {
    const jsonString = LZString.decompressFromBase64(compressedData);
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

export function generateShareableUrl(model: RoughRunwayModel): string {
  const compressed = exportModel(model);
  const baseUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : "https://roughrunway.com";
  return `${baseUrl}/dashboard#model=${compressed}`;
}