<template>
  <div>
    <span data-test="caseFileDetails-beneficiary-phone-number">
      {{ $t(label) }}: {{ phoneNumber.number }}
    </span>
    <span
      v-if="phoneNumber.extension"
      data-test="caseFileDetails-beneficiary-phone-number-extension">
      {{ $t('caseFileDetail.beneficiaryPhoneNumber.extension') }}: {{ phoneNumber.extension }}
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ICaseFileBeneficiaryPhoneNumber } from '@/entities/case-file';

export default Vue.extend({
  name: 'CaseFileDetailsBeneficiaryPhoneNumber',

  props: {
    phoneNumber: {
      type: Object as ()=> ICaseFileBeneficiaryPhoneNumber,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
});

</script>
