import Vue from 'vue';

export type {
  ISearchParams,
  ICombinedSearchResult,
  ISearchResult,
  ITableSearchResults,
  ICombinedIndex,
} from './interfaces/ISearchParams';

export { ECanadaProvinces, ECanadaProvincesName } from './enums/ECanadaProvinces';
export { EOptionItemStatus } from './enums/EOptionItemStatus';
export { ERegistrationMode } from './enums/ERegistrationMode';
export { ERegistrationMethod } from './enums/ERegistrationMethod';
export { IdentityAuthenticationMethod, IdentityAuthenticationStatus, Tier2GambitScreeningId, Tier2State } from './enums/IdentityAuthentication';
export { Status } from './enums/Status';

export type { IDropdownItem } from './interfaces/IDropdownItem';
export type { IErrorReport } from './interfaces/IErrorReport';
export type { IIdMultilingualName } from './interfaces/IIdMultilingualName';
export type { IListOption } from './interfaces/IListOption';
export type { IMultilingual, IMultilingualWithId, IMultilingualEnum } from './interfaces/IMultilingual';
export type { INavigationTab } from './interfaces/INavigationTab';
export type { INavigationTabGroup } from './interfaces/INavigationTabGroup';
export type { IOptionItemData } from './interfaces/IOptionItemData';
export type { IRestResponse } from './interfaces/IRestResponse';
export type { IServerError } from './interfaces/IServerError';
export type { IUserInformation } from './interfaces/IUserInformation';

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
