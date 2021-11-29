<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script>
import { localStorageKeys } from '@/constants/localStorage';

export default {
  name: 'App',
  metaInfo() {
    return {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'metaInfo.app.title',
      // all titles will be injected into this template
      titleTemplate: 'hello',
      meta: [
        { name: 'Content-Security-Policy', content: this.cspContent },
      ],
    };
  },
  async created() {
    // The values of environment variables are currently not loaded in components in production
    localStorage.setItem(
      localStorageKeys.googleMapsAPIKey.name,
      process.env.VUE_APP_GOOGLE_API_KEY,
    );
  },
};

</script>
