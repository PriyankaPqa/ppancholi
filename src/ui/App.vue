<template>
  <!-- App.vue -->
  <v-app>
    <rc-router-view-transition />
  </v-app>
</template>

<script>
import { RcRouterViewTransition } from '@rctech/component-library';

export default {
  name: 'App',
  components: {
    RcRouterViewTransition,
  },
  metaInfo() {
    return {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: this.$t('metaInfo.app.title'),
      // all titles will be injected into this template
      titleTemplate: `${this.$t('metaInfo.app.short')} | %s`,
      meta: [
        { name: 'Content-Security-Policy', content: this.cspContent },
      ],
    };
  },
  data() {
    return {
      cspContent: '',
      cspContentProd: '',
      cspContentDev: `
      connect-src 'self'
        https://localhost:44359
        http://localhost:80
        https://localhost:443
        http://172.20.77.87:8080
        http://172.20.77.110:8080
        http://192.168.0.121:8080
        https://ekr.zdassets.com
        https://rctech.zendesk.com
        ws://172.20.77.87:8080
        ws://192.168.0.121:8080
        ws://172.20.77.110:8080
        wss://rctech.zendesk.com
        https://*.zopim.com
        wss://*.zopim.com
        https://*.zopim.io
        data: gap: https://ssl.gstatic.com 'unsafe-eval';
      default-src 'self'
        https://static.zdassets.com
        data: gap: https://ssl.gstatic.com 'unsafe-eval';
      style-src 'self' 'unsafe-inline'
        https://fonts.googleapis.com
        https://cdnjs.cloudflare.com;
      font-src 'self'
        https://fonts.googleapis.com
        https://fonts.gstatic.com
        https://cdnjs.cloudflare.com
        data:;
      script-src 'self' 'unsafe-eval'
        https://maps.googleapis.com
        https://static.zdassets.com
        data:;
      media-src *;
      img-src 'self'
        https://maps.gstatic.com
        https://*.zopim.io
        data: content:;`,
    };
  },
  created() {
    if (process.env.NODE_ENV === 'development') {
      this.cspContent = this.cspContentDev;
    }
    if (process.env.NODE_ENV === 'production') {
      this.cspContent = this.cspContentProd;
    }
  },
};
</script>
