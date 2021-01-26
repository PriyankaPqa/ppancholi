/**
 * Interfaces
 */

import Vue from 'vue';

export type { IRestResponse } from './interfaces/IRestResponse';
export type { IAuthenticationAccessToken } from './interfaces/IAuthenticationAccessToken';
export type { IMultilingual } from './interfaces/IMultilingual';
export type { INavigationTab } from './interfaces/INavigationTab';

/**
 * Enums
 */
export { ECanadaProvinces } from './enums/ECanadaProvinces';
export { EEventStatus } from './enums/events/EEventStatus';
export { EEventResponseLevels } from './enums/events/EEventResponseLevels';

export type VForm = Vue & {
  validate: (type?: { silent?: boolean }) => boolean;
  reset: () => void;
}
