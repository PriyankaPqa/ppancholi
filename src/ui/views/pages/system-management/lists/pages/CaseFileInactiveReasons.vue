<template>
  <option-list title="system_management.lists.inactiveReasons" has-other />
</template>

<script lang="ts">
import { EOptionLists } from '@/entities/optionItem';
import Vue from 'vue';
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
