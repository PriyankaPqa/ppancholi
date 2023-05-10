import Vue from 'vue';
import householdHelpers from '@/ui/helpers/household';
import { IHouseholdEntity, IHouseholdMemberMetadata, IHouseholdMetadata } from '@libs/entities-lib/household';

export default Vue.extend({
  data() {
    return {
      household: null as IHouseholdEntity,
      householdMetadata: null as IHouseholdMetadata,
    };
  },

  computed: {
    addressFirstLine(): string {
      return householdHelpers.getAddressLines(this.household?.address?.address)[0] || '';
    },

    addressSecondLine(): string {
      return householdHelpers.getAddressLines(this.household?.address?.address)[1] || '';
    },

    primaryBeneficiary(): IHouseholdMemberMetadata {
      return this.householdMetadata?.memberMetadata.find((m: IHouseholdMemberMetadata) => m.id === this.household.primaryBeneficiary);
    },

    primaryBeneficiaryFullName(): string {
      if (!this.primaryBeneficiary) {
        return '';
      }
      const { firstName, lastName } = this.primaryBeneficiary;
      return `${firstName} ${lastName}`;
    },

    hasPhoneNumbers(): boolean {
      if (!this.primaryBeneficiary) {
        return false;
      }
      return !!(this.primaryBeneficiary.mobilePhoneNumber || this.primaryBeneficiary.homePhoneNumber || this.primaryBeneficiary.alternatePhoneNumber);
    },

    country(): string {
      return householdHelpers.countryName(this.household?.address?.address?.country);
    },
  },
});
