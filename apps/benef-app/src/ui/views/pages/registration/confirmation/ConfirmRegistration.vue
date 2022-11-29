<template>
  <confirm-registration-lib :i18n="i18n" />
</template>

<script lang="ts">
import Vue from 'vue';
import ConfirmRegistrationLib from '@libs/registration-lib/components/confirm-registration/ConfirmRegistrationLib.vue';
import { i18n } from '@/ui/plugins';

export default Vue.extend({
  name: 'ConfirmRegistration',
  components: {
    ConfirmRegistrationLib,
  },
  data() {
    return {
      i18n,
    };
  },
});
</script>
