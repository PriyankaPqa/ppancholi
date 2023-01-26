<template>
  <option-list title="system_management.lists.caseNoteCategories" add-button-label="system_management.lists.add.category" />
</template>

<script lang="ts">
import Vue from 'vue';
import { EOptionLists } from '@libs/entities-lib/optionItem';
import { useOptionListStore } from '@/pinia/option-list/optionList';
import OptionList from '../components/OptionList.vue';

export default Vue.extend({
  name: 'CaseNoteCategories',

  components: {
    OptionList,
  },

  created() {
    useOptionListStore().resetState();
    useOptionListStore().list = EOptionLists.CaseNoteCategories;
  },
});
</script>
