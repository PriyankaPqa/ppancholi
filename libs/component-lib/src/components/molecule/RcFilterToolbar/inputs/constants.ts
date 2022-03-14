import { format } from 'date-fns';

export const ISO_FORMAT = 'yyyy-MM-dd';
export const DEFAULT_DATE = format(new Date(), ISO_FORMAT) as string;
export type DatePickerRange = { start: string; end: string }
