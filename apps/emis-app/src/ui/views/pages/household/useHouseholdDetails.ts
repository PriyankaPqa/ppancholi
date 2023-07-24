import { ref, Ref } from 'vue';
import householdHelpers from '@/ui/helpers/household';
import { IHouseholdEntity, IHouseholdMemberMetadata, IHouseholdMetadata } from '@libs/entities-lib/household';

export function useHouseholdDetails(household: Ref<IHouseholdEntity>, householdMetadata: Ref<IHouseholdMetadata>) {
  const primaryMember = ref(null);

  function getAddressFirstLine(): string {
    return householdHelpers.getAddressLines(household?.value?.address?.address)[0] || '';
  }

  function getAddressSecondLine(): string {
    return householdHelpers.getAddressLines(household?.value?.address?.address)[1] || '';
  }

  function getPrimaryMember(): IHouseholdMemberMetadata {
    const primaryMemberData = householdMetadata?.value?.memberMetadata?.find((m: IHouseholdMemberMetadata) => m.id === household?.value?.primaryBeneficiary);
    primaryMember.value = primaryMemberData;
    return primaryMemberData;
  }

  function getPrimaryMemberFullName(): string {
    const primaryMemberData = primaryMember?.value || getPrimaryMember();
    if (!primaryMemberData) {
      return '';
    }
    const { firstName, lastName } = primaryMemberData;
    return `${firstName} ${lastName}`;
  }

  function hasPhoneNumbers(): boolean {
    const primaryMemberData = primaryMember?.value || getPrimaryMember();
    if (!primaryMemberData) {
      return false;
    }
    return !!(primaryMemberData.mobilePhoneNumber || primaryMemberData.homePhoneNumber || primaryMemberData.alternatePhoneNumber);
  }

  function getCountry() {
    return householdHelpers.countryName(household?.value?.address?.address?.country);
  }

  return {
    getAddressFirstLine,
    getAddressSecondLine,
    getPrimaryMember,
    getCountry,
    getPrimaryMemberFullName,
    hasPhoneNumbers,
  };
}
