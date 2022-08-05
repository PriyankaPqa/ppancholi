<template>
  <option-list
    title="system_management.lists.preferredLanguages"
    add-button-label="system_management.lists.add.language"
    has-other
    has-default />
</template>

<script lang="ts">
import Vue from 'vue';
import { EOptionLists } from '@libs/entities-lib/optionItem';
import OptionList from '../components/OptionList.vue';

export default Vue.extend({
  name: 'PreferredLanguage',

  components: {
    OptionList,
  },

  created() {
    this.$storage.optionList.mutations.resetState();
    this.$storage.optionList.mutations.setList(EOptionLists.PreferredLanguages);
  },
});
</script>
