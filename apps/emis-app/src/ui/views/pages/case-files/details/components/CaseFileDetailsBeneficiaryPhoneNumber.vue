<template>
  <div>
    <span data-test="caseFileDetails-beneficiary-phone-number">
      {{ $t(label) }}: {{ displayPhone }}
    </span>
    <span
      v-if="displayExtension"
      data-test="caseFileDetails-beneficiary-phone-number-extension">
      {{ $t('caseFileDetail.beneficiaryPhoneNumber.extension') }}: {{ displayExtension }}
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IPhoneNumber } from '@libs/registration-lib/entities/household-create';

export default Vue.extend({
  name: 'CaseFileDetailsBeneficiaryPhoneNumber',

  props: {
    phoneNumber: {
      type: Object as ()=> IPhoneNumber,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },

  computed: {
    displayPhone(): string {
      return (this.phoneNumber.e164Number || this.phoneNumber.e164number) && this.phoneNumber.countryCode && this.phoneNumber.countryCode !== 'CA'
        && this.phoneNumber.countryCode !== 'US' ? (this.phoneNumber.e164Number || this.phoneNumber.e164number) : this.phoneNumber.number;
    },
    displayExtension(): string {
      return (this.phoneNumber.e164Number || this.phoneNumber.e164number) && this.phoneNumber.countryCode && this.phoneNumber.countryCode !== 'CA'
        && this.phoneNumber.countryCode !== 'US' ? null : this.phoneNumber.extension;
    },
  },
});

</script>
