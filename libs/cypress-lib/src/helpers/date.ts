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
 * output format example: May 30, 2023
 */
export function formatCurrentDate() {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  return formattedDate;
}
