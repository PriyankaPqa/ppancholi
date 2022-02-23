import Vue from 'vue';
/**
 * Interfaces
 */

export type { IAppUserData } from './interfaces/IAppUserData';
export type { IAuthenticationAccessToken } from './interfaces/IAuthenticationAccessToken';
export type { IMultilingual } from './interfaces/IMultilingual';
// eslint-disable-next-line import/no-cycle
export type { INavigationTab } from './interfaces/ui/INavigationTab';
export type { IRestResponse } from './interfaces/IRestResponse';
export type { IAzureSearchParams } from './interfaces/IAzureSearchParams';
export type { IAzureSearchResult } from './interfaces/IAzureSearchResult';
export type { IListOption } from './interfaces/IListOption';
export type { IAddress } from './interfaces/IAddress';
export type { IIdMultilingualName } from './interfaces/IIdMultilingualName';
export type { IAzureCombinedSearchResult } from './interfaces/IAzureSearchResult';

/**
 * Enums
 */
export { ECanadaProvinces } from './enums/ECanadaProvinces';
export { EEventSummarySections } from './enums/EEventSummarySections';

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
}

export type ConfirmationDialog = Vue & {
  open: () => Promise<unknown>;
}
