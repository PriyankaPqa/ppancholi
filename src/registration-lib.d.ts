import Vue, { PluginFunction, VueConstructor } from 'vue';

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
export const HouseholdMembers: VueConstructor<Vue>;
export const HouseholdMemberForm: VueConstructor<Vue>;
export const PersonalInformation: VueConstructor<Vue>;
export const PrivacyStatement: VueConstructor<Vue>;
export const ReviewRegistration: VueConstructor<Vue>;
