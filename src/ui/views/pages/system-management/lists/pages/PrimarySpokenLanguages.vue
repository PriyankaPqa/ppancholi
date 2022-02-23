<template>
  <option-list title="system_management.lists.primarySpokenLanguages" add-button-label="system_management.lists.add.language" has-other has-default />
</template>

<script lang="ts">
import Vue from 'vue';
import { EOptionLists } from '@/entities/optionItem';
import OptionList from '../components/OptionList.vue';

export default Vue.extend({
  name: 'PrimarySpokenLanguage',

  components: {
    OptionList,
  },

  created() {
    this.$storage.optionList.mutations.resetState();
    this.$storage.optionList.mutations.setList(EOptionLists.PrimarySpokenLanguages);
  },
});
</script>
