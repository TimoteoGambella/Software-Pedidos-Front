// Formatear números en formato argentino: 1.000.000,50
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0,00';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0,00';
  
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// Formatear números sin decimales: 1.000.000
export const formatNumber = (value) => {
  if (value === null || value === undefined) return '0';
  
  const num = typeof value === 'string' ? parseInt(value) : value;
  
  if (isNaN(num)) return '0';
  
  return new Intl.NumberFormat('es-AR').format(num);
};

// Parsear números desde formato argentino a número
export const parseCurrency = (value) => {
  if (!value) return 0;
  
  // Remover puntos (separadores de miles) y reemplazar coma por punto
  const cleaned = value.toString().replace(/\./g, '').replace(/,/g, '.');
  return parseFloat(cleaned) || 0;
};
