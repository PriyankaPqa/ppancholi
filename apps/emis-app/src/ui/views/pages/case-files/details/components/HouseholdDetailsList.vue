<template>
  <div>
    <div
      v-if="hasPhoneNumbers"
      class="d-flex flex-row align-start mb-2 rc-body14">
      <v-icon small class="mr-2 mt-1" :color="onDuplicatePage ? 'secondary' : 'gray darken-2'">
        mdi-phone
      </v-icon>
      <div class="d-flex flex-column">
        <span v-if="onDuplicatePage && primaryBeneficiary.contactInformation.homePhoneNumber"> {{ $t("household.profile.member.phone_numbers.home") }}: </span>
        <case-file-details-beneficiary-phone-number
          v-if="primaryBeneficiary.contactInformation.homePhoneNumber"
          data-test="caseFileDetails-home-phone-number"
          :phone-number="primaryBeneficiary.contactInformation.homePhoneNumber"
          :show-labels="!onDuplicatePage"
          :label="'caseFileDetail.beneficiaryPhoneNumber.homeInitial'" />

        <span v-if="onDuplicatePage && primaryBeneficiary.contactInformation.mobilePhoneNumber"> {{ $t("household.profile.member.phone_numbers.mobile") }}: </span>
        <case-file-details-beneficiary-phone-number
          v-if="primaryBeneficiary.contactInformation.mobilePhoneNumber"
          data-test="caseFileDetails-mobile-phone-number"
          :phone-number="primaryBeneficiary.contactInformation.mobilePhoneNumber"
          :show-labels="!onDuplicatePage"
          :label="'caseFileDetail.beneficiaryPhoneNumber.mobileInitial'" />

        <span v-if="onDuplicatePage && primaryBeneficiary.contactInformation.alternatePhoneNumber"> {{ $t("household.profile.member.phone_numbers.alternate") }}: </span>
        <case-file-details-beneficiary-phone-number
          v-if="primaryBeneficiary.contactInformation.alternatePhoneNumber"
          data-test="caseFileDetails-alternate-phone-number"
          :phone-number="primaryBeneficiary.contactInformation.alternatePhoneNumber"
          :show-labels="!onDuplicatePage"
          :label="'caseFileDetail.beneficiaryPhoneNumber.alternateInitial'" />
      </div>
    </div>

    <div
      v-if="addressFirstLine || addressSecondLine"
      class="d-flex flex-row align-start mb-2 rc-body14">
      <v-icon small class="mr-2 mt-1" :color="onDuplicatePage ? 'secondary' : 'gray darken-2'">
        mdi-map-marker
      </v-icon>
      <div class="d-flex flex-column" data-test="caseFileDetails-home-address">
        <span v-if="onDuplicatePage"> {{ $t('caseFileDetail.addressLabel') }}: </span>
        <span v-if="addressFirstLine">{{ addressFirstLine }}</span>
        <span v-if="addressSecondLine">{{ addressSecondLine }}</span>
        <span v-if="country">{{ country }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IMemberEntity } from '@libs/entities-lib/household-create';
import CaseFileDetailsBeneficiaryPhoneNumber from './CaseFileDetailsBeneficiaryPhoneNumber.vue';

export default Vue.extend({
  name: 'HouseholdDetailsList',

  components: {
    CaseFileDetailsBeneficiaryPhoneNumber,
  },

  props: {
    primaryBeneficiary: {
      type: Object as ()=> IMemberEntity,
      required: true,
    },

    addressFirstLine: {
      type: String,
      required: true,
    },

    addressSecondLine: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      default: '',
    },

    hasPhoneNumbers: {
      type: Boolean,
       required: true,
    },

    onDuplicatePage: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style scoped lang="scss">
  .divider {
    margin: 16px -16px;
    border-top: 1px solid var(--v-grey-lighten2);
  }

</style>
