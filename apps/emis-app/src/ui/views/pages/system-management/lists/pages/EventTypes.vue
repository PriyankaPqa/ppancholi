<template>
  <option-list title="system_management.lists.eventTypes" add-button-label="system_management.lists.add.type" has-other has-default />
</template>

<script lang="ts">
import Vue from 'vue';
import { EOptionLists } from '@libs/entities-lib/optionItem';
import { useOptionListStore } from '@/pinia/option-list/optionList';
import OptionList from '../components/OptionList.vue';

export default Vue.extend({
  name: 'EventTypes',

  components: {
    OptionList,
  },

  created() {
    useOptionListStore().resetState();
    useOptionListStore().list = EOptionLists.EventTypes;
  },
});
</script>
