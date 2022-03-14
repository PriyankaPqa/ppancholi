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
import { EFinancialFrequency } from '@/entities/financial-assistance';

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
        return this.$storage.financialAssistance.getters.newSubItem().frequency;
      },

      set(value: EFinancialFrequency) {
        this.$storage.financialAssistance.mutations.setNewSubItemFrequency(value);
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
