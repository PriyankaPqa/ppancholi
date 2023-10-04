import { format } from 'date-fns';

/**
 * Split a date string into year, month(1-12) and day.
 */
export function splitDate(date: string) {
  const inputDate = new Date(date);
  return {
    year: inputDate.getUTCFullYear(),
    month: inputDate.getUTCMonth() + 1,
    day: inputDate.getUTCDate(),
  };
}

/**
 * date argument takes any of these formats i.e. long date(Jan 23, 2022) OR short date(01-23-2022) OR ISO format(2022-01-23THH:mm:ss.sssZ)
 * output format: 2022-01-23
 */
export function formatDate(date: string) {
  const inputDate = new Date(date);
  const year = inputDate.getUTCFullYear();
  const month = (inputDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = inputDate.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a current date in the format
 * @param toFormat - format type, default: PPp
 * @returns {string} - Formatted date string
 */
export function getToday(toFormat = 'PP'): string {
  return format(Date.now(), toFormat);
}

/**
 * Format a date in the given format
 * @param toFormat - format type, default: PPp
 * @returns {string} - Formatted date string
 */
export function returnDateInFormat(date: string, toFormat = 'PPp'): string {
  return format(new Date(date), toFormat);
}
