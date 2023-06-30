<template>
  <option-list
    title="system_management.lists.caseFileTags"
    add-button-label="caseFile.tags.AddTag"
    has-restrict-financial />
</template>

<script lang="ts">
import Vue from 'vue';
import { EOptionLists } from '@libs/entities-lib/optionItem';
import { useOptionListStore } from '@/pinia/option-list/optionList';
import OptionList from '../components/OptionList.vue';

export default Vue.extend({
  name: 'CaseFileTags',

  components: {
    OptionList,
  },

  created() {
    useOptionListStore().resetState();
    useOptionListStore().list = EOptionLists.CaseFileTags;
  },
});
</script>
