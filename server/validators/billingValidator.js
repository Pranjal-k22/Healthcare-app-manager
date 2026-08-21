/**
 * Validate payment input
 * @param {object} data
 * @returns {{ valid: boolean, error?: string }}
 */
const validatePaymentInput = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Payment payload must be a JSON object' };
  }

  const { paymentMethod } = data;
  if (!paymentMethod || typeof paymentMethod !== 'string' || paymentMethod.trim().length < 2) {
    return {
      valid: false,
      error: 'Payment method is required (e.g. Card, Visa, Insurance, ApplePay)',
    };
  }

  if (paymentMethod.length > 100) {
    return {
      valid: false,
      error: 'Payment method description cannot exceed 100 characters',
    };
  }

  return { valid: true };
};

module.exports = {
  validatePaymentInput,
};
