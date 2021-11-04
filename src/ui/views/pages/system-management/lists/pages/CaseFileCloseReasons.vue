<template>
  <option-list title="system_management.lists.caseFileCloseReasons" add-button-label="system_management.lists.add.reason" has-other />
</template>

<script lang="ts">
import Vue from 'vue';
import { EOptionLists } from '@/entities/optionItem';
import OptionList from '../components/OptionList.vue';

export default Vue.extend({
  name: 'CaseFileCloseReasons',

  components: {
    OptionList,
  },

  created() {
    this.$storage.optionList.mutations.resetState();
    this.$storage.optionList.mutations.setList(EOptionLists.CaseFileCloseReasons);
  },
});
</script>
