<template>
  <lib-household-members :i18n="i18n" />
</template>

<script lang="ts">
import Vue from 'vue';

import { HouseholdMembers as LibHouseholdMembers } from '@crctech/registration-lib';
import { i18n } from '@/ui/plugins';

export default Vue.extend({
  name: 'HouseholdMembers',

  components: {
    LibHouseholdMembers,
  },

  data() {
    return {
      i18n,
    };
  },
});
</script>
