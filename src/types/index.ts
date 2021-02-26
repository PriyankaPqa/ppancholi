import Vue from 'vue';
/**
 * Interfaces
 */
export type { IRestResponse } from './interfaces/IRestResponse';
export type { IAuthenticationAccessToken } from './interfaces/IAuthenticationAccessToken';
export type { IMultilingual } from './interfaces/IMultilingual';
export type { INavigationTab } from './interfaces/ui/INavigationTab';
export type { IAzureSearchParams } from './interfaces/IAzureSearchParams';
export type { IOptionListItem } from './interfaces/IOptionListItem';
export type { IOptionListSubItem } from './interfaces/IOptionListSubItem';
export type { IAzureSearchResult } from './interfaces/IAzureSearchResult';
export type { IListOption } from './interfaces/IListOption';

/**
 * Enums
 */
export { ECanadaProvinces } from './enums/ECanadaProvinces';
export { EOptionLists } from './enums/EOptionLists';
export { EOptionListItemStatus } from './enums/EOptionListItemStatus';

export type VForm = Vue & {
  validate: (type?: { silent?: boolean }) => boolean;
  reset: () => void;
}
