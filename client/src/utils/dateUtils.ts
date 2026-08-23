/**
 * Indian Standard Time (IST / Asia/Kolkata) Date & Time Utilities
 */

/**
 * Formats a 24-hour time string ("14:30") to Indian 12-hour AM/PM IST format ("02:30 PM IST")
 */
export const formatTimeIndian = (time24?: string, includeISTSuffix = true): string => {
  if (!time24) return '';
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  if (isNaN(hours)) return time24;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;

  const formattedTime = `${formattedHours}:${minutes} ${ampm}`;
  return includeISTSuffix ? `${formattedTime} IST` : formattedTime;
};

/**
 * Formats an ISO date string ("2026-08-23") to Indian Standard Date format ("23 Aug 2026")
 */
export const formatDateIndian = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const dateObj = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00+05:30`);
    if (isNaN(dateObj.getTime())) return dateStr;

    return dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  } catch (e) {
    return dateStr;
  }
};

/**
 * Formats a date and time into full Indian Standard Time display ("23 Aug 2026, 02:30 PM IST")
 */
export const formatDateTimeIndian = (dateStr?: string, time24?: string): string => {
  const formattedDate = formatDateIndian(dateStr);
  const formattedTime = formatTimeIndian(time24, true);

  if (formattedDate && formattedTime) {
    return `${formattedDate}, ${formattedTime}`;
  }
  return formattedDate || formattedTime || '';
};
