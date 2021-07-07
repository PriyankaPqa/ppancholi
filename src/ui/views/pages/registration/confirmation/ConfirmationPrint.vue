<template>
  <lib-confirmation-print />
</template>

<script lang="ts">
import Vue from 'vue';
import { ConfirmationPrint as LibConfirmationPrint } from '@crctech/registration-lib';

export default Vue.extend({
  name: 'ConfirmationPrint',
  components: {
    LibConfirmationPrint,
  },
});
</script>
