import Vue from 'vue';

export type {
  IAzureSearchParams,
  IAzureCombinedSearchResult,
  IAzureSearchResult,
  IAzureTableSearchResults,
  ICombinedIndex,
} from './interfaces/IAzureSearchParams';

export { ECanadaProvinces } from './enums/ECanadaProvinces';
export { EOptionItemStatus } from './enums/EOptionItemStatus';
export { ERegistrationMode } from './enums/ERegistrationMode';
export { ERegistrationMethod } from './enums/ERegistrationMethod';

export type { IDropdownItem } from './interfaces/IDropdownItem';
export type { IErrorReport } from './interfaces/IErrorReport';
export type { IIdMultilingualName } from './interfaces/IIdMultilingualName';
export type { IListOption } from './interfaces/IListOption';
export type { IMultilingual } from './interfaces/IMultilingual';
export type { INavigationTab } from './interfaces/INavigationTab';
export type { INavigationTabGroup } from './interfaces/INavigationTabGroup';
export type { IOptionItemData } from './interfaces/IOptionItemData';
export type { IRestResponse } from './interfaces/IRestResponse';
export type { ISearchData } from './interfaces/ISearchData';
export type { IServerError } from './interfaces/IServerError';

export type VForm = Vue & {
  validate: (type?: { silent?: boolean }) => Promise<boolean>;
  reset: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: Record<string, any>
  flags: {
    untouched: boolean,
    touched: boolean,
    dirty: boolean,
    pristine: boolean,
    valid: boolean,
    invalid: boolean,
    validated: boolean,
    pending: boolean,
    required: boolean,
    changed: boolean,
    passed: boolean,
    failed: boolean,
  }
};
