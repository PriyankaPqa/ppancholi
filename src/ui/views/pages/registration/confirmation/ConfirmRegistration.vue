<template>
  <lib-confirm-registration :i18n="i18n" />
</template>

<script lang="ts">
import Vue from 'vue';
import { ConfirmRegistration as LibConfirmRegistration } from '@crctech/registration-lib';
import { i18n } from '@/ui/plugins';

export default Vue.extend({
  name: 'ConfirmRegistration',
  components: {
    LibConfirmRegistration,
  },
  data() {
    return {
      i18n,
    };
  },
});
</script>
