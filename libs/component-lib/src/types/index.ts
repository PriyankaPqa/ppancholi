export type { IRestResponse } from './IRestResponse';
export type { ISearchData } from './ISearchData';
export type { IFilterToolbarLabels } from './IFilterToolbarLabels';
export * from './FilterTypes';

export type VForm = Vue & {
  validate: (type?: { silent?: boolean }) => boolean;
  reset: () => void;
}

export type RcConfirmationDialogType = Vue & {
  open: () => Promise<unknown>;
}
