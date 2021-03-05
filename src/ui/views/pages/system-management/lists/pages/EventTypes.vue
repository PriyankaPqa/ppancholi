<template>
  <option-list title="system_management.lists.eventTypes" has-other has-default />
</template>

<script lang="ts">
import { EOptionLists } from '@/entities/optionItem';
import Vue from 'vue';
import OptionList from '../components/OptionList.vue';

export default Vue.extend({
  name: 'EventTypes',

  components: {
    OptionList,
  },

  created() {
    this.$storage.optionList.mutations.resetState();
    this.$storage.optionList.mutations.setList(EOptionLists.EventTypes);
  },
});
</script>
