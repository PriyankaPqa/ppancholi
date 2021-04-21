/**
 * Interfaces
 */

import Vue from 'vue';

export type VForm = Vue & {
  validate: (type?: { silent?: boolean }) => boolean;
  reset: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: Record<string, any>;
}

export type RcConfirmationDialogType = Vue & {
  open: () => Promise<unknown>;
}

export type { IOptionItemData } from './interfaces/IOptionItemData';
export type { IRestResponse } from './interfaces/IRestResponse';
export type { IMultilingual } from './interfaces/IMultilingual';
export type { INavigationTab } from './interfaces/INavigationTab';
export type { ISearchData } from './interfaces/ISearchData';
export type { IEntity } from './interfaces/IEntity';
export type { ILeftMenuItem } from './interfaces/ILeftMenuItem';
export type { IAzureSearchResult } from './interfaces/IAzureSearchResult';
export type { IAzureSearchParams } from './interfaces/IAzureSearchParams';

/**
 * Enums
 */
export { ECanadaProvinces } from './enums/ECanadaProvinces';
export { EOptionItemStatus } from './enums/EOptionItemStatus';
