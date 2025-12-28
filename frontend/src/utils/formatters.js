export const formatCurrency = (amount, currency = 'PEN') => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// --- CORRECCIÓN 1: formatDate ---
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC', // ¡Esto evita que se reste 1 día!
  };
  
  // Si la fecha es nula o inválida, retornamos vacío para evitar errores
  if (!date) return '';

  return new Date(date).toLocaleDateString('es-PE', {
    ...defaultOptions,
    ...options,
  });
};

// --- CORRECCIÓN 2: formatShortDate ---
export const formatShortDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-PE', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC', // ¡Agregado!
  });
};

// --- CORRECCIÓN 3: formatMonthYear ---
export const formatMonthYear = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC', // ¡Agregado!
  });
};

export const getMonthName = (monthNumber) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[monthNumber - 1] || '';
};

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (name) => {
  if (!name) return ''; // Pequeña protección extra
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};