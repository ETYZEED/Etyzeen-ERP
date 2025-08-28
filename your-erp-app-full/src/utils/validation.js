// Comprehensive validation utilities for the ERP application

/**
 * Validates if a value is a non-empty string
 * @param {*} value - The value to validate
 * @param {string} fieldName - The name of the field for error messages
 * @returns {Object} Validation result with isValid and error message
 */
export const validateNonEmptyString = (value, fieldName = 'Field') => {
  if (typeof value !== 'string' || value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName} must be a non-empty string`
    };
  }
  return { isValid: true };
};

/**
 * Validates if a value is a positive number
 * @param {*} value - The value to validate
 * @param {string} fieldName - The name of the field for error messages
 * @returns {Object} Validation result with isValid and error message
 */
export const validatePositiveNumber = (value, fieldName = 'Field') => {
  if (typeof value !== 'number' || value <= 0 || isNaN(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be a positive number`
    };
  }
  return { isValid: true };
};

/**
 * Validates if a value is a non-negative number
 * @param {*} value - The value to validate
 * @param {string} fieldName - The name of the field for error messages
 * @returns {Object} Validation result with isValid and error message
 */
export const validateNonNegativeNumber = (value, fieldName = 'Field') => {
  if (typeof value !== 'number' || value < 0 || isNaN(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be a non-negative number`
    };
  }
  return { isValid: true };
};

/**
 * Validates if a value is a valid date string
 * @param {*} value - The value to validate
 * @param {string} fieldName - The name of the field for error messages
 * @returns {Object} Validation result with isValid and error message
 */
export const validateDateString = (value, fieldName = 'Date') => {
  if (typeof value !== 'string' || value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName} must be a non-empty string`
    };
  }
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid date format`
    };
  }
  
  return { isValid: true, date };
};

/**
 * Validates if a value is a valid email address
 * @param {*} value - The value to validate
 * @param {string} fieldName - The name of the field for error messages
 * @returns {Object} Validation result with isValid and error message
 */
export const validateEmail = (value, fieldName = 'Email') => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof value !== 'string' || !emailRegex.test(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid email address`
    };
  }
  return { isValid: true };
};

/**
 * Validates if a value is a valid phone number (Indonesian format)
 * @param {*} value - The value to validate
 * @param {string} fieldName - The name of the field for error messages
 * @returns {Object} Validation result with isValid and error message
 */
export const validatePhoneNumber = (value, fieldName = 'Phone') => {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  if (typeof value !== 'string' || !phoneRegex.test(value.replace(/[^0-9+]/g, ''))) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid Indonesian phone number`
    };
  }
  return { isValid: true };
};

/**
 * Validates if a value is a valid Rupiah currency string
 * @param {*} value - The value to validate
 * @param {string} fieldName - The name of the field for error messages
 * @returns {Object} Validation result with isValid and error message
 */
export const validateRupiahString = (value, fieldName = 'Amount') => {
  if (typeof value !== 'string') {
    return {
      isValid: false,
      error: `${fieldName} must be a string`
    };
  }
  
  const numericValue = value.replace(/[^0-9]/g, '');
  if (!numericValue) {
    return {
      isValid: false,
      error: `${fieldName} must contain numeric characters`
    };
  }
  
  return { isValid: true, numericValue: parseFloat(numericValue) };
};

/**
 * Validates if an array contains valid objects with required fields
 * @param {Array} array - The array to validate
 * @param {Array} requiredFields - Array of required field names
 * @param {string} arrayName - The name of the array for error messages
 * @returns {Object} Validation result with isValid and error messages
 */
export const validateArrayOfObjects = (array, requiredFields = [], arrayName = 'Array') => {
  if (!Array.isArray(array)) {
    return {
      isValid: false,
      errors: [`${arrayName} must be an array`]
    };
  }
  
  const errors = [];
  
  array.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      errors.push(`Item at index ${index} must be an object`);
      return;
    }
    
    requiredFields.forEach(field => {
      if (!(field in item)) {
        errors.push(`Item at index ${index} is missing required field: ${field}`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates if a value is one of the allowed values
 * @param {*} value - The value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} fieldName - The name of the field for error messages
 * @returns {Object} Validation result with isValid and error message
 */
export const validateEnum = (value, allowedValues, fieldName = 'Field') => {
  if (!allowedValues.includes(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`
    };
  }
  return { isValid: true };
};

/**
 * Batch validation of multiple fields
 * @param {Array} validations - Array of validation objects { value, validator, fieldName }
 * @returns {Object} Validation result with isValid and error messages
 */
export const validateBatch = (validations) => {
  const errors = [];
  
  validations.forEach(({ value, validator, fieldName }) => {
    const result = validator(value, fieldName);
    if (!result.isValid) {
      errors.push(result.error);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
