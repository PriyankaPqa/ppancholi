import Vue from 'vue';
/**
 * Interfaces
 */

export type VForm = Vue & {
  validate: (type?: { silent?: boolean }) => boolean;
  reset: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: Record<string, any>;
}

export type RcConfirmationDialogType = Vue & {
  open: () => Promise<unknown>;
}

export type { IRegistrationMenuItem } from './interfaces/IRegistrationMenuItem';
export type { IHouseholdSearchCriteria } from './interfaces/IHouseholdSearchCriteria';
