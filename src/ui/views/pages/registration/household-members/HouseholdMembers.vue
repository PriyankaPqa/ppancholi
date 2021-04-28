<template>
  <lib-household-members />
</template>

<script lang="ts">
import Vue from 'vue';

import { HouseholdMembers as LibHouseholdMembers } from '@crctech/registration-lib';

export default Vue.extend({
  name: 'HouseholdMembers',

  components: {
    LibHouseholdMembers,
  },
});
</script>
