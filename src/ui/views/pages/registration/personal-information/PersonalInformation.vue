<template>
  <lib-personal-information
    :min-age-registration="MIN_AGE_REGISTRATION"
    :i18n="i18n"
    :recaptcha-key="recaptchaKey" />
</template>
<script lang="ts">
import Vue from 'vue';
import { PersonalInformation as LibPersonalInformation } from '@crctech/registration-lib';
import { MIN_AGE_REGISTRATION } from '@/constants/validations';
import { i18n } from '@/ui/plugins';
import { localStorageKeys } from '@/constants/localStorage';

export default Vue.extend({
  name: 'PersonalInformation',
  components: {
    LibPersonalInformation,
  },

  data() {
    return {
      MIN_AGE_REGISTRATION,
      i18n,
      recaptchaKey: localStorage.getItem(localStorageKeys.recaptchaKey.name),
    };
  },
});
</script>
