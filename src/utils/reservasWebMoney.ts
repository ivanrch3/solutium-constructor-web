export const formatReservasWebMoney = (value: number, currency: string | null | undefined): string => {
  const normalizedCurrency = (currency || 'USD').toUpperCase();
  if (normalizedCurrency === 'CRC') {
    return `₡${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(value))}`;
  }
  return new Intl.NumberFormat('es', { style: 'currency', currency: normalizedCurrency }).format(value);
};
