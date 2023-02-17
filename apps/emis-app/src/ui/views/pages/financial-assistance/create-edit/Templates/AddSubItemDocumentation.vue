<template>
  <validation-provider>
    <v-radio-group v-model="documentationRequired" class="mt-1" row hide-details>
      <v-radio :label="$t('common.no')" :value="false" data-test="financialAssistanceItems__addSubItemDocNo" />
      <v-radio :label="$t('common.yes')" :value="true" data-test="financialAssistanceItems__addSubItemDocYes" />
    </v-radio-group>
  </validation-provider>
</template>

<script lang="ts">
import Vue from 'vue';
import { useFinancialAssistanceStore } from '@/pinia/financial-assistance/financial-assistance';

export default Vue.extend({
  name: 'AddSubItemDocumentation',

  computed: {
    /**
     * The value prop of the new item
     */
    documentationRequired: {
      get(): boolean {
        return useFinancialAssistanceStore().newSubItem.documentationRequired;
      },

      set(value: boolean) {
        useFinancialAssistanceStore().newSubItem.documentationRequired = value;
      },
    },
  },
});
</script>
