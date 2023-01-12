<template>
  <review-registration-lib
    :i18n="i18n"
    :recaptcha-key="$hasFeature(FeatureKeys.BotProtection) && !isCaptchaAllowedIpAddress ? recaptchaKey : ''"
    :disable-autocomplete="disableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import ReviewRegistrationLib from '@libs/registration-lib/components/review/ReviewRegistrationLib.vue';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { i18n } from '@/ui/plugins';
import { localStorageKeys } from '@/constants/localStorage';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';

export default Vue.extend({
  name: 'ReviewRegistration',

  components: {
    ReviewRegistrationLib,
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

  computed: {
    isCaptchaAllowedIpAddress(): boolean {
      return useTenantSettingsStore().recaptcha.ipAddressIsAllowed;
    },
  },
});
</script>
