<template>
  <!-- App.vue -->
  <v-app>
    <div v-if="isLoading || checkingAccount" class="loading_container">
      <div>
        <div :class="`${$i18n.locale === 'en' ? 'logoEn' : 'logoFr'}`" />

        <span v-if="isLoading" class="mt-8 mb-4">
          {{ $t('app.loading') }}
        </span>
        <span v-if="checkingAccount" class="mt-8 mb-4">
          {{ $t('app.checkingAccount') }}
        </span>
        <v-progress-circular color="primary" indeterminate />
      </div>
    </div>
    <rc-router-view-transition v-else />

    <activity-watcher v-if="!isLoading" />

    <!-- eslint-disable -->
    <rc-confirmation-dialog
      ref="defaultConfirm"
      :show.sync="showConfirm"
      :title="dialogTitle"
      :messages="dialogMessages"
      :show-cancel="showCancelButton"
      :show-close="false"
      :cancel-button-key="cancelActionLabel"
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
      :message="singleDialogMessage"
      :min-height="dialogMinHeight"
      :max-width="dialogMaxWidth" />
  </v-app>
</template>

<script>
/* eslint-disable no-console */
import Vue from 'vue';
import { localStorageKeys } from '@/constants/localStorage';
import { RcRouterViewTransition, RcConfirmationDialog, RcErrorDialog } from '@crctech/component-library';
import sanitizeHtml from 'sanitize-html';

import ActivityWatcher from '@/ui/ActivityWatcher.vue';
import AuthenticationProvider from '@/auth/AuthenticationProvider';

export default {
  name: 'App',

  components: {
    ActivityWatcher,
    RcRouterViewTransition,
    RcConfirmationDialog,
    RcErrorDialog,
  },

  metaInfo() {
    return {
      // if no subcomponents specify a metaInfo.title, this title will be used.
      title: this.$t('metaInfo.app.title'),
      // all titles will be injected into this template
      titleTemplate: `${this.$t('metaInfo.app.short')} | %s`,
    };
  },

  data() {
    return {
      showConfirm: false,
      showMessage: false,
      dialogTitle: '',
      dialogMessages: '',
      singleDialogMessage: '',
      dialogHtml: '',
      dialogMaxWidth: 500,
      dialogMinHeight: 'auto',
      submitActionLabel: this.$t('common.buttons.ok'),
      cancelActionLabel: this.$t('common.buttons.no'),
      showCancelButton: true,
    };
  },

  computed: {
    isLoading() {
      return this.$store.state.dashboard.initLoading;
    },
    checkingAccount() {
      return this.$store.state.dashboard.checkingAccount;
    },
  },

  async created() {
    Vue.prototype.$confirm = async ({
      title, messages, htmlContent = null, submitActionLabel = null, cancelActionLabel = null, showCancelButton = true,
    }) => {
      this.dialogTitle = title;
      this.dialogMessages = messages;
      this.submitActionLabel = submitActionLabel || this.$t('common.buttons.yes');
      this.cancelActionLabel = cancelActionLabel || this.$t('common.buttons.no');
      this.showCancelButton = showCancelButton;
      this.dialogHtml = sanitizeHtml(htmlContent, { allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, '*': ['class'] } });
      this.showConfirm = true;

      const userChoice = await this.$refs.defaultConfirm.open();

      this.showConfirm = false;
      return userChoice;
    };

    Vue.prototype.$message = ({
      title, message, submitActionLabel, minHeight, maxWidth,
    }) => {
      // we only show one message box at a time
      if (this.showMessage) {
        return false;
      }
      this.dialogTitle = title;
      this.singleDialogMessage = message;
      this.submitActionLabel = submitActionLabel || this.$t('common.buttons.ok');
      if (minHeight) {
        this.dialogMinHeight = minHeight;
      }
      if (maxWidth) {
        this.dialogMaxWidth = maxWidth;
      }

      this.showMessage = true;
      return true;
    };

    // The values of environment variables are currently not loaded in components in production. TODO: investigate why and find a fix
    localStorage.setItem(localStorageKeys.googleMapsAPIKey.name, process.env.VUE_APP_GOOGLE_API_KEY);
    localStorage.setItem(localStorageKeys.baseUrl.name, process.env.VUE_APP_API_BASE_URL);

    console.log('APP_VERSION_HERE', process.env.VUE_APP_VERSION);
    console.log('VUE_APP_API_BASE_URL', process.env.VUE_APP_API_BASE_URL);

    // The access token will be refreshed automatically every 5 minutes
    AuthenticationProvider.startAccessTokenAutoRenewal(60000 * 5);
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
