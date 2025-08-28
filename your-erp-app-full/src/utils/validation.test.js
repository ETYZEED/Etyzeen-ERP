// Test script for validation utilities
import { 
  validateNonEmptyString, 
  validatePositiveNumber, 
  validateNonNegativeNumber,
  validateDateString,
  validateEmail,
  validatePhoneNumber,
  validateRupiahString,
  validateArrayOfObjects,
  validateEnum,
  validateBatch
} from './validation.js';

// Test validation functions
console.log('=== Testing Validation Utilities ===\n');

// Test validateNonEmptyString
console.log('1. Testing validateNonEmptyString:');
console.log('Valid string:', validateNonEmptyString('test', 'Name'));
console.log('Empty string:', validateNonEmptyString('', 'Name'));
console.log('Non-string:', validateNonEmptyString(123, 'Name'));
console.log('');

// Test validatePositiveNumber
console.log('2. Testing validatePositiveNumber:');
console.log('Valid positive number:', validatePositiveNumber(5, 'Quantity'));
console.log('Zero:', validatePositiveNumber(0, 'Quantity'));
console.log('Negative number:', validatePositiveNumber(-1, 'Quantity'));
console.log('Non-number:', validatePositiveNumber('abc', 'Quantity'));
console.log('');

// Test validateNonNegativeNumber
console.log('3. Testing validateNonNegativeNumber:');
console.log('Valid positive number:', validateNonNegativeNumber(5, 'Stock'));
console.log('Zero:', validateNonNegativeNumber(0, 'Stock'));
console.log('Negative number:', validateNonNegativeNumber(-1, 'Stock'));
console.log('Non-number:', validateNonNegativeNumber('abc', 'Stock'));
console.log('');

// Test validateDateString
console.log('4. Testing validateDateString:');
console.log('Valid date:', validateDateString('2024-01-15', 'Date'));
console.log('Invalid date:', validateDateString('invalid-date', 'Date'));
console.log('Empty string:', validateDateString('', 'Date'));
console.log('');

// Test validateEmail
console.log('5. Testing validateEmail:');
console.log('Valid email:', validateEmail('test@example.com', 'Email'));
console.log('Invalid email:', validateEmail('invalid-email', 'Email'));
console.log('');

// Test validatePhoneNumber
console.log('6. Testing validatePhoneNumber:');
console.log('Valid phone:', validatePhoneNumber('081234567890', 'Phone'));
console.log('Invalid phone:', validatePhoneNumber('123456', 'Phone'));
console.log('');

// Test validateRupiahString
console.log('7. Testing validateRupiahString:');
console.log('Valid Rupiah:', validateRupiahString('Rp 1.000.000', 'Amount'));
console.log('Invalid Rupiah:', validateRupiahString('abc', 'Amount'));
console.log('');

// Test validateArrayOfObjects
console.log('8. Testing validateArrayOfObjects:');
const validArray = [{ name: 'test', price: 1000 }];
const invalidArray = [{}, { name: 'test' }];
console.log('Valid array:', validateArrayOfObjects(validArray, ['name', 'price'], 'Products'));
console.log('Invalid array:', validateArrayOfObjects(invalidArray, ['name', 'price'], 'Products'));
console.log('');

// Test validateEnum
console.log('9. Testing validateEnum:');
const statuses = ['active', 'inactive', 'pending'];
console.log('Valid enum:', validateEnum('active', statuses, 'Status'));
console.log('Invalid enum:', validateEnum('invalid', statuses, 'Status'));
console.log('');

// Test validateBatch
console.log('10. Testing validateBatch:');
const batchResult = validateBatch([
  { value: 'test', validator: validateNonEmptyString, fieldName: 'Name' },
  { value: 5, validator: validatePositiveNumber, fieldName: 'Quantity' },
  { value: 'invalid-email', validator: validateEmail, fieldName: 'Email' }
]);
console.log('Batch validation result:', batchResult);
console.log('');

console.log('=== Validation Testing Complete ===');
