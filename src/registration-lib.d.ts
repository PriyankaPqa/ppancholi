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
export const CurrentAddressForm: VueConstructor<Vue>;
export const CurrentAddressTemplate: VueConstructor<Vue>;
export const AddressForm: VueConstructor<Vue>;
export const Addresses: VueConstructor<Vue>;
export const AdditionalMembers: VueConstructor<Vue>;
export const AdditionalMemberForm: VueConstructor<Vue>;
export const PersonalInformation: VueConstructor<Vue>;
export const PrivacyStatement: VueConstructor<Vue>;
export const ReviewRegistration: VueConstructor<Vue>;
export const ConfirmRegistration: VueConstructor<Vue>;
export const ConfirmationPrint: VueConstructor<Vue>;
export const CrcPrivacyStatement: VueConstructor<Vue>;
export const AddEditAdditionalMembers: VueConstructor<Vue>;
export const AdditionalMemberTemplate: VueConstructor<Vue>;
export const AdditionalMemberSection: VueConstructor<Vue>;
