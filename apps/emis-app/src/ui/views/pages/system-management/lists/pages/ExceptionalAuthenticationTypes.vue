<template>
  <option-list title="system_management.lists.exceptionalAuthenticationTypes" add-button-label="system_management.lists.add.category" has-other has-default />
</template>

<script lang="ts">
import Vue from 'vue';
import { EOptionLists } from '@libs/entities-lib/optionItem';
import { useOptionListStore } from '@/pinia/option-list/optionList';
import OptionList from '../components/OptionList.vue';

export default Vue.extend({
  name: 'ExceptionalAuthenticationTypes',

  components: {
    OptionList,
  },

  created() {
    useOptionListStore().resetState();
    useOptionListStore().list = EOptionLists.ExceptionalAuthenticationTypes;
  },
});
</script>
