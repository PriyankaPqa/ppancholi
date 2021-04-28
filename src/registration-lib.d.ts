import Vue, { PluginFunction, VueConstructor } from 'vue';

import {
  IBeneficiary, IBeneficiaryData, IContactInformation, IPerson, IPersonData, IAddress,
} from './entities/beneficiary';

import { IOptionItemData } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface InstallFunction extends PluginFunction<any> {
  installed?: boolean;
}

declare const ComponentLibrary: { install: InstallFunction };
export default ComponentLibrary;

/**
 * Component types
 */
export const ContactInformationForm: VueConstructor<Vue>;
export const IdentityForm: VueConstructor<Vue>;
export const IndigenousIdentityForm: VueConstructor<Vue>;
export const TempAddressForm: VueConstructor<Vue>;
export const AddressForm: VueConstructor<Vue>;
export const Addresses: VueConstructor<Vue>;

/**
 * Other
 */

export const mockAddress: (force?: Partial<IAddress>) => IAddress;
export const mockBeneficiary: (force?: Partial<IBeneficiaryData>) => IBeneficiary;
export const mockContactInformation: (force?: Partial<IContactInformation>) => IContactInformation;
export const mockGenders: () => IOptionItemData[];
export const mockIndigenousCommunitiesItems: () => IOptionItemData[];
export const mockIndigenousTypesItems: () => IOptionItemData[];
export const mockPerson: (force?: Partial<IPersonData>) => IPerson;
export const mockPreferredLanguages: () => IOptionItemData[];
export const mockPrimarySpokenLanguages: () => IOptionItemData[];
