<template>
  <confirmation-print-lib />
</template>

<script lang="ts">
import Vue from 'vue';
import ConfirmationPrintLib from '@libs/registration-lib/components/confirm-registration/ConfirmationPrintLib.vue';

export default Vue.extend({
  name: 'ConfirmationPrint',
  components: {
    ConfirmationPrintLib,
  },
});
</script>
