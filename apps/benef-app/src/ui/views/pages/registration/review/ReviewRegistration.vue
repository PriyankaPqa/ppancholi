<template>
  <lib-review-registration
    :i18n="i18n"
    :recaptcha-key="$hasFeature(FeatureKeys.BotProtection) ? recaptchaKey : ''"
    :disable-autocomplete="disableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import LibReviewRegistration from '@libs/registration-lib/components/review/ReviewRegistration.vue';
import { FeatureKeys } from '@libs/registration-lib/entities/tenantSettings';
import { i18n } from '@/ui/plugins';
import { localStorageKeys } from '@/constants/localStorage';

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
