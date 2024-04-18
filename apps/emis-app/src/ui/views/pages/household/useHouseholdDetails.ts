import { ref, Ref } from 'vue';
import householdHelpers from '@/ui/helpers/household';
import { IHouseholdEntity } from '@libs/entities-lib/household';
import { IMemberEntity } from '@libs/entities-lib/household-create';

export function useHouseholdDetails(household: Ref<IHouseholdEntity>, members: Ref<IMemberEntity[]>) {
  const primaryMember = ref(null) as Ref<IMemberEntity>;

  function getAddressFirstLine(): string {
    return householdHelpers.getAddressLines(household?.value?.address?.address)[0] || '';
  }

  function getAddressSecondLine(): string {
    return householdHelpers.getAddressLines(household?.value?.address?.address)[1] || '';
  }

  function getPrimaryMember(): IMemberEntity {
    const primaryMemberData = members?.value?.find((m) => m.id === household?.value?.primaryBeneficiary);
    primaryMember.value = primaryMemberData;
    return primaryMemberData;
  }

  function getPrimaryMemberFullName(): string {
    const primaryMemberData = primaryMember?.value || getPrimaryMember();
    if (!primaryMemberData) {
      return '';
    }
    const { firstName, lastName } = primaryMemberData.identitySet;
    return `${firstName} ${lastName}`;
  }

  function hasPhoneNumbers(): boolean {
    const primaryMemberData = primaryMember?.value || getPrimaryMember();
    if (!primaryMemberData?.contactInformation) {
      return false;
    }
    return !!(primaryMemberData.contactInformation.mobilePhoneNumber?.number || primaryMemberData.contactInformation.homePhoneNumber?.number
        || primaryMemberData.contactInformation.alternatePhoneNumber?.number);
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
