export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateMedicineForm = (data) => {
  const errors = {};
  if (!data.name || data.name.trim() === '') errors.name = 'Medicine name is required';
  if (!data.quantity || Number(data.quantity) < 0) errors.quantity = 'Valid quantity required';
  if (!data.price || Number(data.price) <= 0) errors.price = 'Valid selling price required';
  if (!data.expiryDate) errors.expiryDate = 'Expiry date is required';
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
