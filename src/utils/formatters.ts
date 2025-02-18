
export const formatCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  }
  return cleaned;
};

export const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return cleaned;
};

export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return "0.00";
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
};
