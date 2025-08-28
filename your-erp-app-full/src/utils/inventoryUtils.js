// Validation functions
export const validateInventoryInput = (inventoryItems, productName, quantitySold) => {
  const errors = [];
  
  // Check if inventoryItems is an array
  if (!Array.isArray(inventoryItems)) {
    errors.push('Inventory items must be an array');
    return { isValid: false, errors };
  }
  
  // Check if productName is provided and is a string
  if (!productName || typeof productName !== 'string') {
    errors.push('Product name is required and must be a string');
  }
  
  // Check if quantitySold is a positive number
  if (typeof quantitySold !== 'number' || quantitySold <= 0) {
    errors.push('Quantity sold must be a positive number');
  }
  
  // Check if product exists in inventory
  const productExists = inventoryItems.some(item => 
    item.name.toLowerCase() === productName.toLowerCase()
  );
  
  if (!productExists) {
    errors.push(`Product "${productName}" not found in inventory`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const handleInventoryUpdate = (inventoryItems, productName, quantitySold) => {
  // Validate input first
  const validation = validateInventoryInput(inventoryItems, productName, quantitySold);
  if (!validation.isValid) {
    console.error('Inventory update validation failed:', validation.errors);
    throw new Error(`Inventory update failed: ${validation.errors.join(', ')}`);
  }

  return inventoryItems.map(item => {
    if (item.name.toLowerCase() === productName.toLowerCase()) {
      const newStock = item.stock - quantitySold;
      
      // Prevent negative stock
      const finalStock = Math.max(0, newStock);
      
      const newStatus = finalStock <= item.reorderPoint ? 
        (finalStock <= 0 ? 'Habis' : 'Hampir Habis') : 'Aman';
      
      return { ...item, stock: finalStock, status: newStatus };
    }
    return item;
  });
};

// Additional validation utilities
export const validateStockLevel = (stock, reorderPoint) => {
  if (typeof stock !== 'number' || stock < 0) {
    return { isValid: false, error: 'Stock must be a non-negative number' };
  }
  
  if (typeof reorderPoint !== 'number' || reorderPoint < 0) {
    return { isValid: false, error: 'Reorder point must be a non-negative number' };
  }
  
  return { isValid: true };
};

export const getInventoryStatus = (stock, reorderPoint) => {
  const validation = validateStockLevel(stock, reorderPoint);
  if (!validation.isValid) {
    return 'Invalid';
  }
  
  if (stock <= 0) {
    return 'Habis';
  } else if (stock <= reorderPoint) {
    return 'Hampir Habis';
  } else {
    return 'Aman';
  }
};
