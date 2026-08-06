/**
 * Safely parses ISO timestamp string from backend and formats into local Date and Time.
 * If timestamp lacks timezone offset ('Z' or '+/-'), appends 'Z' to treat as UTC.
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  let dateStr = String(timestamp);
  if (dateStr.includes('T') && !dateStr.endsWith('Z') && !dateStr.includes('+') && !/-\d{2}:\d{2}$/.test(dateStr)) {
    dateStr += 'Z';
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(timestamp);
  
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

export const formatDateOnly = (timestamp) => {
  if (!timestamp) return 'N/A';
  let dateStr = String(timestamp);
  if (dateStr.includes('T') && !dateStr.endsWith('Z') && !dateStr.includes('+') && !/-\d{2}:\d{2}$/.test(dateStr)) {
    dateStr += 'Z';
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(timestamp);

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTimeOnly = (timestamp) => {
  if (!timestamp) return 'N/A';
  let dateStr = String(timestamp);
  if (dateStr.includes('T') && !dateStr.endsWith('Z') && !dateStr.includes('+') && !/-\d{2}:\d{2}$/.test(dateStr)) {
    dateStr += 'Z';
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(timestamp);

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};
