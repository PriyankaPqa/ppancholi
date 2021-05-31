<template>
  <lib-additional-members :i18n="i18n" />
</template>

<script lang="ts">
import Vue from 'vue';

import { AdditionalMembers as LibAdditionalMembers } from '@crctech/registration-lib';
import { i18n } from '@/ui/plugins';

export default Vue.extend({
  name: 'AdditionalMembers',

  components: {
    LibAdditionalMembers,
  },

  data() {
    return {
      i18n,
    };
  },
});
</script>
