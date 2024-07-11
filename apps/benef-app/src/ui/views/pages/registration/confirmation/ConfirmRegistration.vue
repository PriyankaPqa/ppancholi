<template>
  <confirm-registration-lib />
</template>

<script lang="ts">
import Vue from 'vue';
import ConfirmRegistrationLib from '@libs/registration-lib/components/confirm-registration/ConfirmRegistrationLib.vue';

export default Vue.extend({
  name: 'ConfirmRegistration',
  components: {
    ConfirmRegistrationLib,
  },
});
</script>
