/**
 * Get current month key in YYYY-MM format
 */
export const getCurrentMonthKey = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Format month key to readable format (e.g., "Januari 2025")
 */
export const formatMonthKey = (key: string): string => {
  if (!key) return '';
  const [year, month] = key.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
};
