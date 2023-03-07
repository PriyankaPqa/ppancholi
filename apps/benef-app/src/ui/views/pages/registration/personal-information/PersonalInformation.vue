<template>
  <personal-information-lib
    :min-age-registration="MIN_AGE_REGISTRATION"
    :i18n="i18n"
    :allow-duplicate-emails="$hasFeature(FeatureKeys.SelfRegistration)"
    :recaptcha-key="$hasFeature(FeatureKeys.BotProtection) && !isCaptchaAllowedIpAddress ? recaptchaKey : ''" />
</template>
<script lang="ts">
import Vue from 'vue';
import PersonalInformationLib from '@libs/registration-lib/components/personal-information/PersonalInformationLib.vue';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { MIN_AGE_REGISTRATION } from '@/constants/validations';
import { i18n } from '@/ui/plugins';
import { localStorageKeys } from '@/constants/localStorage';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';

export default Vue.extend({
  name: 'PersonalInformation',
  components: {
    PersonalInformationLib,
  },

  data() {
    return {
      MIN_AGE_REGISTRATION,
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
