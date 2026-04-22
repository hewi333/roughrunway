// Test file for export/import functionality
import { describe, it, expect } from 'vitest';
import { exportModel, importModel } from '../lib/model-export';
import { useRoughRunwayStore } from '../lib/store';

describe('export and import model', () => {
  it('works correctly', () => {
    // Create a default model using the store
    const store = useRoughRunwayStore.getState();
    const model = store.model;
    
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
});