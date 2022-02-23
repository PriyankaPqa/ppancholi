<template>
  <option-list
    title="system_management.lists.financialAssistance"
    has-description
    is-cascading
    hide-item-drag
    item-label="financialAssistance.nestedTable.headers.item"
    sub-item-label="financialAssistance.nestedTable.headers.subItem"
    sub-item-name-label="financialAssistance.nestedTable.headers.subItem"
    add-sub-item-label="financialAssistance.addSubItem"
    add-button-label="system_management.lists.add.category" />
</template>

<script lang="ts">
import Vue from 'vue';
import { EOptionLists } from '@/entities/optionItem';
import OptionList from '../components/OptionList.vue';

export default Vue.extend({
  name: 'FinancialAssistance',

  components: {
    OptionList,
  },

  created() {
    this.$storage.optionList.mutations.resetState();
    this.$storage.optionList.mutations.setList(EOptionLists.FinancialAssistance);
  },
});
</script>
