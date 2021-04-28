<template>
  <lib-addresses />
</template>

<script lang="ts">
import Vue from 'vue';
import { Addresses as LibAddresses } from '@crctech/registration-lib';

export default Vue.extend({
  name: 'Addresses',
  components: {
    LibAddresses,
  },
});
</script>
