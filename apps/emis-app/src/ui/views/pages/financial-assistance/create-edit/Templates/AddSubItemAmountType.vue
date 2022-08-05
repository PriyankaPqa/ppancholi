<template>
  <v-select-with-validation
    v-model="amountType"
    data-test="financialAssistanceItems__addSubItemFixedVariable"
    hide-details
    dense
    background-color="white"
    :items="amountModes"
    :rules="{ required: true }"
    :label="`${$t('financialAssistance.nestedTable.headers.amountType')}*`" />
</template>

<script lang="ts">
import Vue from 'vue';
import { VSelectWithValidation } from '@libs/component-lib/components';
import helpers from '@/ui/helpers/helpers';
import { EFinancialAmountModes } from '@libs/entities-lib/financial-assistance';

export default Vue.extend({
  name: 'AddSubItemAmountType',

  components: {
    VSelectWithValidation,
  },

  computed: {
    /**
     * The value prop of the new item
     */
    amountType: {
      get(): EFinancialAmountModes {
        return this.$storage.financialAssistance.getters.newSubItem().amountType;
      },

      set(value: EFinancialAmountModes) {
        this.$storage.financialAssistance.mutations.setNewSubItemAmountType(value);
      },
    },

    /**
     * Enum mapping for FA amount types
     */
    amountModes() {
      return helpers.enumToTranslatedCollection(EFinancialAmountModes, 'enums.financialAmountModes');
    },
  },
});
</script>
