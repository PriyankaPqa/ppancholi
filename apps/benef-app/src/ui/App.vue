<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script>
import { localStorageKeys } from '@/constants/localStorage';
import { sessionStorageKeys } from '@/constants/sessionStorage';

export default {
  name: 'App',

  async created() {
    // The values of environment variables are currently not loaded in components in production -
    localStorage.setItem(
      localStorageKeys.googleMapsAPIKey.name,
      process.env.VITE_GOOGLE_API_KEY,
    );

    localStorage.setItem(
      localStorageKeys.recaptchaKey.name,
      process.env.VITE_GOOGLE_RECAPTCHA_KEY,
    );

    sessionStorage.setItem(
      sessionStorageKeys.appVersion.name,
      process.env.VITE_VERSION,
    );
  },
};
</script>
