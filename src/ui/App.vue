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
    // The values of environment variables are currently not loaded in components in production. TODO: investigate why and find a fix
    localStorage.setItem(
      localStorageKeys.googleMapsAPIKey.name,
      process.env.VUE_APP_GOOGLE_API_KEY,
    );
  },
};
</script>
