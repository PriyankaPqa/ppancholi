<template>
  <lib-confirmation-print />
</template>

<script lang="ts">
import Vue from 'vue';
import LibConfirmationPrint from '@libs/registration-lib/components/confirm-registration/ConfirmationPrint.vue';

export default Vue.extend({
  name: 'ConfirmationPrint',
  components: {
    LibConfirmationPrint,
  },
});
</script>
