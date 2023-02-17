<template>
  <v-select-with-validation
    v-model="frequency"
    data-test="financialAssistanceItems__addSubItemFrequency"
    hide-details
    dense
    background-color="white"
    :items="frequencies"
    :rules="{ required: true }"
    :label="`${$t('financialAssistance.nestedTable.headers.frequency')}*`" />
</template>

<script lang="ts">
import Vue from 'vue';
import { VSelectWithValidation } from '@libs/component-lib/components';
import helpers from '@/ui/helpers/helpers';
import { EFinancialFrequency } from '@libs/entities-lib/financial-assistance';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';

export default Vue.extend({
  name: 'AddSubItemFrequency',

  components: {
    VSelectWithValidation,
  },

  computed: {
    /**
     * The value prop of the new item
     */
    frequency: {
      get(): EFinancialFrequency {
        return useFinancialAssistanceStore().newSubItem.frequency;
      },

      set(value: EFinancialFrequency) {
        useFinancialAssistanceStore().newSubItem.frequency = value;
      },
    },

    /**
     * Enum mapping for FA frequency
     */
    frequencies() {
      return helpers.enumToTranslatedCollection(EFinancialFrequency, 'enums.financialFrequency');
    },
  },
});
</script>
