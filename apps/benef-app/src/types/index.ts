/**
 * Interfaces
 */

import Vue from 'vue';

export type { IOptionItemData } from './interfaces/IOptionItemData';
export type { IMultilingual } from './interfaces/IMultilingual';
export type { INavigationTab } from './interfaces/INavigationTab';
export type { ISearchData } from './interfaces/ISearchData';
export type { IEntity } from './interfaces/IEntity';

/**
 * Enums
 */
export { ECanadaProvinces } from './enums/ECanadaProvinces';
export { EOptionItemStatus } from './enums/EOptionItemStatus';

export type VForm = Vue & {
  validate: (type?: { silent?: boolean }) => boolean;
  reset: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: Record<string, any>
}
