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
  mounted() {
    const script = document.createElement('script');

    script.src = 'https://acsbapp.com/apps/app/dist/js/app.js';
    script.async = true;
    script.onload = function accessiBe() {
      // eslint-disable-next-line no-undef
      acsbJS.init({
        statementLink: '',
        footerHtml: '',
        hideMobile: false,
        hideTrigger: false,
        language: 'en',
        position: 'right',
        leadColor: '#146FF8',
        triggerColor: '#146FF8',
        triggerRadius: '50%',
        triggerPositionX: 'right',
        triggerPositionY: 'bottom',
        triggerIcon: 'people',
        triggerSize: 'medium',
        triggerOffsetX: 20,
        triggerOffsetY: 20,
        mobile: {
          triggerSize: 'small',
          triggerPositionX: 'right',
          triggerPositionY: 'center',
          triggerOffsetX: 0,
          triggerOffsetY: 0,
          triggerRadius: '50%',
        },
      });
    };

    document.body.appendChild(script);
  },

};
</script>
