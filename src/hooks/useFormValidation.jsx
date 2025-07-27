import { useState, useCallback } from 'react';

export const useFormValidation = (initialState, validationRules) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field];
      const value = formData[field];
      
      if (rule.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = rule.message || `${field} is required`;
      } else if (rule.minLength && value && value.length < rule.minLength) {
        newErrors[field] = `${field} must be at least ${rule.minLength} characters`;
      } else if (rule.pattern && value && !rule.pattern.test(value)) {
        newErrors[field] = rule.message || `Invalid ${field} format`;
      } else if (rule.custom && value) {
        const customError = rule.custom(value, formData);
        if (customError) newErrors[field] = customError;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validationRules]);

  const reset = useCallback(() => {
    setFormData(initialState);
    setErrors({});
  }, [initialState]);

  return {
    formData,
    setFormData,
    errors,
    handleChange,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};