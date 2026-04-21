// Test file for export/import functionality
import { test, expect } from '@playwright/test';
import { exportModel, importModel } from '../lib/model-export';
import { createDefaultModel } from '../lib/store';

test('export and import model works correctly', async () => {
  // Create a default model
  const model = createDefaultModel();
  
  // Export the model
  const exportedData = exportModel(model);
  
  // Check that the exported data is a string
  expect(typeof exportedData).toBe('string');
  
  // Check that the exported data is not empty
  expect(exportedData.length).toBeGreaterThan(0);
  
  // Import the model
  const importedModel = importModel(exportedData);
  
  // Check that the imported model is not null
  expect(importedModel).not.toBeNull();
  
  // Check that the imported model has the same name as the original
  expect(importedModel?.name).toBe(model.name);
  
  // Check that the imported model has the same treasury as the original
  expect(importedModel?.treasury.stablecoins).toEqual(model.treasury.stablecoins);
  expect(importedModel?.treasury.fiat).toEqual(model.treasury.fiat);
  expect(importedModel?.treasury.volatileAssets).toEqual(model.treasury.volatileAssets);
});