<template>
  <option-list title="system_management.lists.referralOutcomeStatuses" add-button-label="system_management.lists.add.status" />
</template>

<script lang="ts">
import Vue from 'vue';
import { EOptionLists } from '@/entities/optionItem';
import OptionList from '../components/OptionList.vue';

export default Vue.extend({
  name: 'ReferralOutcomeStatus',

  components: {
    OptionList,
  },

  created() {
    this.$storage.optionList.mutations.resetState();
    this.$storage.optionList.mutations.setList(EOptionLists.ReferralOutcomeStatus);
  },
});
</script>
