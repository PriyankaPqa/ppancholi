<template>
  <option-list title="system_management.lists.caseFileInactiveReasons" has-other />
</template>

<script lang="ts">
import Vue from 'vue';
import { EOptionLists } from '@/entities/optionItem';
import OptionList from '../components/OptionList.vue';

export default Vue.extend({
  name: 'CaseFileInactiveReasons',

  components: {
    OptionList,
  },

  created() {
    this.$storage.optionList.mutations.resetState();
    this.$storage.optionList.mutations.setList(EOptionLists.CaseFileInactiveReasons);
  },
});
</script>
