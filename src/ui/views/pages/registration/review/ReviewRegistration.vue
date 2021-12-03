<template>
  <lib-review-registration :i18n="i18n" :recaptcha-key="recaptchaKey" />
</template>

<script lang="ts">
import Vue from 'vue';
import { ReviewRegistration as LibReviewRegistration } from '@crctech/registration-lib';
import { i18n } from '@/ui/plugins';
import { localStorageKeys } from '@/constants/localStorage';

export default Vue.extend({
  name: 'ReviewRegistration',

  components: {
    LibReviewRegistration,
  },

  data() {
    return {
      i18n,
      recaptchaKey: localStorage.getItem(localStorageKeys.recaptchaKey.name),
    };
  },
});
</script>
