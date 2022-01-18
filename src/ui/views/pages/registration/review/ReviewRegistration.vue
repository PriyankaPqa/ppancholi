<template>
  <lib-review-registration
    :i18n="i18n"
    :recaptcha-key="$hasFeature(FeatureKeys.BotProtection) ? recaptchaKey : ''"
    :disable-autocomplete="disableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import { ReviewRegistration as LibReviewRegistration } from '@crctech/registration-lib';
import { i18n } from '@/ui/plugins';
import { localStorageKeys } from '@/constants/localStorage';
import { FeatureKeys } from '@crctech/registration-lib/src/entities/tenantSettings';

export default Vue.extend({
  name: 'ReviewRegistration',

  components: {
    LibReviewRegistration,
  },

  props: {
    disableAutocomplete: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      i18n,
      recaptchaKey: localStorage.getItem(localStorageKeys.recaptchaKey.name),
      FeatureKeys,
    };
  },
});
</script>
