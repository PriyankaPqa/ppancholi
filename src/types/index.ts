/**
 * Interfaces
 */

import Vue from 'vue';

export type { IRestResponse } from './interfaces/IRestResponse';
export type { IAuthenticationAccessToken } from './interfaces/IAuthenticationAccessToken';
export type { IMultilingual } from './interfaces/IMultilingual';
export type { INavigationTab } from './interfaces/ui/INavigationTab';
export type { ISearchData } from './interfaces/ISearchData';

/**
 * Enums
 */
export { ECanadaProvinces } from './enums/ECanadaProvinces';
export { EOptionListItemStatus } from './enums/EOptionListItemStatus';

export type VForm = Vue & {
  validate: (type?: { silent?: boolean }) => boolean;
  reset: () => void;
}
