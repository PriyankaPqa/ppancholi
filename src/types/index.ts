import Vue from 'vue';
/**
 * Interfaces
 */

export type { IAppUserData } from './interfaces/IAppUserData';
export type { IAuthenticationAccessToken } from './interfaces/IAuthenticationAccessToken';
export type { IMultilingual } from './interfaces/IMultilingual';
export type { INavigationTab } from './interfaces/ui/INavigationTab';
export type { IRestResponse } from './interfaces/IRestResponse';
export type { IAzureSearchParams } from './interfaces/IAzureSearchParams';
export type { IAzureSearchResult } from './interfaces/IAzureSearchResult';
export type { IListOption } from './interfaces/IListOption';
export type { IAddress } from './interfaces/IAddress';

/**
 * Enums
 */
export { ECanadaProvinces } from './enums/ECanadaProvinces';
export { EEventSummarySections } from './enums/EEventSummarySections';

export type VForm = Vue & {
  validate: (type?: { silent?: boolean }) => boolean;
  reset: () => void;
}
