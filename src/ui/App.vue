<template>
  <!-- App.vue -->
  <v-app>
    <div v-if="isLoading" class="loading_container">
      <div>
        <div :class="`${$i18n.locale === 'en' ? 'logoEn' : 'logoFr'}`" />

        <span class="mt-8 mb-4">
          {{ $t('app.loading') }}
        </span>
        <v-progress-circular color="primary" indeterminate />
      </div>
    </div>
    <rc-router-view-transition v-else />

    <!-- eslint-disable -->
    <rc-confirmation-dialog
      ref="defaultConfirm"
      :show.sync="showConfirm"
      :title="dialogTitle"
      :messages="dialogMessages"
      :submit-button-key="submitActionLabel">
      <template>
        <div v-html="dialogHtml" />
      </template>
    </rc-confirmation-dialog>
    <!-- eslint-enable -->

    <rc-error-dialog
      :show.sync="showMessage"
      :title="dialogTitle"
      :submit-action-label="submitActionLabel"
      :message="dialogMessages[0] || dialogMessages"
      :min-height="dialogMinHeight"
      :max-width="dialogMaxWidth" />
  </v-app>
</template>

<script>
import Vue from 'vue';
import { RcRouterViewTransition, RcConfirmationDialog, RcErrorDialog } from '@crctech/component-library';
import sanitizeHtml from 'sanitize-html';
import { localStorageKeys } from '@/constants/localStorage';

export default {
  name: 'App',

  components: {
    RcRouterViewTransition,
    RcConfirmationDialog,
    RcErrorDialog,
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
      showConfirm: false,
      showMessage: false,
      dialogTitle: '',
      dialogMessages: '',
      dialogHtml: '',
      dialogMaxWidth: 500,
      dialogMinHeight: 'auto',
      submitActionLabel: this.$t('common.buttons.ok'),
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

  computed: {
    isLoading() {
      return this.$store.state.dashboard.initLoading;
    },
  },

  async created() {
    if (process.env.NODE_ENV === 'development') {
      this.cspContent = this.cspContentDev;
    }
    if (process.env.NODE_ENV === 'production') {
      this.cspContent = this.cspContentProd;
    }

    Vue.prototype.$confirm = async (title, messages, htmlContent = null, submitActionLabel = 'common.buttons.yes') => {
      this.dialogTitle = title;
      this.dialogMessages = messages;
      if (submitActionLabel) { this.submitActionLabel = submitActionLabel; }
      this.dialogHtml = sanitizeHtml(htmlContent, { allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, '*': ['class'] } });
      this.showConfirm = true;

      const userChoice = await this.$refs.defaultConfirm.open();

      this.showConfirm = false;
      return userChoice;
    };

    Vue.prototype.$message = ({
      title, message, submitActionLabel, minHeight, maxWidth,
    }) => {
      this.dialogTitle = title;
      this.dialogMessages = message;
      if (submitActionLabel) { this.submitActionLabel = submitActionLabel; }
      if (minHeight) { this.dialogMinHeight = minHeight; }
      if (maxWidth) { this.dialogMaxWidth = maxWidth; }

      this.showMessage = true;
      return true;
    };

    // The values of environment variables are currently not loaded in components in production. TODO: investigate why and find a fix
    localStorage.setItem(localStorageKeys.prefixRegistrationLink.name, process.env.VUE_APP_EVENT_LINK_PREFIX);
    localStorage.setItem(localStorageKeys.googleMapsAPIKey.name, process.env.VUE_APP_GOOGLE_API_KEY);
    localStorage.setItem(localStorageKeys.baseUrl.name, process.env.VUE_APP_API_BASE_URL);
  },
};
</script>

<style scoped lang="scss">

.loading_container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  & > div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}

$url-logo: "../../public/img/logo.png";
$url-rc-en-logo: "../../public/img/logos/rc/rc-en.svg";
$url-rc-fr-logo: "../../public/img/logos/rc/rc-fr.svg";

.logoEn {
  background-size: cover;
  background-image: url($url-rc-en-logo);
}

.logoFr {
  background-size: cover;
  background-image: url($url-rc-fr-logo);
}

@media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
  .logoEn, .logoFr {
    background-image: url($url-logo);
    width: 40px;
    height: 40px;
  }
}
@media only screen and (min-width: $breakpoint-sm-min) and (max-width: $breakpoint-md-max) {
  .logoEn, .logoFr {
    width: 133px;
    height: 48px;
  }
}
@media only screen and (min-width: $breakpoint-lg-min) {
  .logoEn, .logoFr {
    width:  160px;
    height: 64px;
  }
}
</style>
