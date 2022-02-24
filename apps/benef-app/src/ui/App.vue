<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script>
import { localStorageKeys } from '@/constants/localStorage';

export default {
  name: 'App',
  async created() {
    // The values of environment variables are currently not loaded in components in production.
    localStorage.setItem(
      localStorageKeys.googleMapsAPIKey.name,
      process.env.VUE_APP_GOOGLE_API_KEY,
    );

    localStorage.setItem(
      localStorageKeys.recaptchaKey.name,
      process.env.VUE_APP_GOOGLE_RECAPTCHA_KEY,
    );
  },
};

</script>
