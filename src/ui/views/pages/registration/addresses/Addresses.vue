<template>
  <lib-addresses :i18n="i18n" />
</template>

<script lang="ts">
import Vue from 'vue';
import { Addresses as LibAddresses } from '@crctech/registration-lib';
import { i18n } from '@/ui/plugins';

export default Vue.extend({
  name: 'Addresses',
  components: {
    LibAddresses,
  },
  data() {
    return {
      i18n,
    };
  },
});
</script>
