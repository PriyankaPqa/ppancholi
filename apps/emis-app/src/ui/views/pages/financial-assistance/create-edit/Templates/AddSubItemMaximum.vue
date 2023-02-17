<template>
  <v-text-field-with-validation
    v-model="maximum"
    data-test="financialAssistanceItems__addSubItemMaximum"
    type="number"
    show-all-decimal
    hide-details
    dense
    background-color="white"
    :rules="{ required: true, min_value: 0.01, max_value: 99999999 }"
    :label="`${$t('financialAssistance.nestedTable.headers.maximum')}*`"
    @blur="roundMaximum" />
</template>

<script lang="ts">
import Vue from 'vue';
import { VTextFieldWithValidation } from '@libs/component-lib/components';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';

export default Vue.extend({
  name: 'AddSubItemMaximum',

  components: {
    VTextFieldWithValidation,
  },

  computed: {
    /**
     * The value prop of the new item
     */
    maximum: {
      get(): number {
        return useFinancialAssistanceStore().newSubItem.maximumAmount;
      },

      set(value: number) {
        useFinancialAssistanceStore().newSubItem.maximumAmount = value;
      },
    },
  },

  methods: {
    roundMaximum() {
      const vNum = Number(this.maximum);

      if (Number.isNaN(vNum)) {
        return;
      }

      this.maximum = Math.round(vNum * 100) / 100;
    },
  },
});
</script>
