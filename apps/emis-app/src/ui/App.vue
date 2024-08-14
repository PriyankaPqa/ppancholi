<template>
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
      apply-data-test="apply-action-dialog-confirmation"
      cancel-data-test="cancel-action-dialog-confirmation"
      submit-data-test="submit-action-dialog-confirmation"
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

    <error-report-toast
      v-if="showReportToast"
      :key="lastErrorTime"
      :show.sync="showReportToast"
      :message="errorToastMessage"
      :error="toastError" />
  </v-app>
</template>

<script>
import Vue from 'vue';
import { localStorageKeys } from '@/constants/localStorage';
import { sessionStorageKeys } from '@/constants/sessionStorage';
import { RcRouterViewTransition, RcConfirmationDialog, RcErrorDialog } from '@libs/component-lib/components';
import sanitizeHtml from 'sanitize-html';
import ActivityWatcher from '@/ui/ActivityWatcher.vue';
import AuthenticationProvider from '@/auth/AuthenticationProvider';
import helpers from '@/ui/helpers/helpers';
import ErrorReportToast from '@/ui/shared-components/ErrorReportToast.vue';
import { Survey } from 'survey-vue';
import { useDashboardStore } from '@/pinia/dashboard/dashboard';
import { initializeStores } from '@/ui/helpers/cypress';

Vue.component('Survey', Survey);

export default {

  name: 'App',

  components: {
    ActivityWatcher,
    RcRouterViewTransition,
    RcConfirmationDialog,
    RcErrorDialog,
    ErrorReportToast,
  },

  metaInfo() {
    return {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: this.$t('metaInfo.app.title'),
      // all titles will be injected into this template.
      titleTemplate: `${this.$t('metaInfo.app.short')} | %s`,
    };
  },

  data() {
    return {
      showConfirm: false,
      showMessage: false,
      showReportToast: false,
      errorToastMessage: '',
      lastErrorTime: null,
      toastError: null,
      dialogTitle: '',
      dialogMessages: '',
      singleDialogMessage: '',
      dialogHtml: '',
      dialogMaxWidth: 500,
      dialogMinHeight: 'auto',
      submitActionLabel: this.$t('common.buttons.ok'),
      cancelActionLabel: this.$t('common.buttons.no'),
      showCancelButton: true,
      waitBeforeSignalRSubscriptions: 5000,
      intervalSignalRSubscriptions: 3 * 1000,
    };
  },

  computed: {
    isLoading() {
      return useDashboardStore().initLoading;
    },
    checkingAccount() {
      return useDashboardStore().checkingAccount;
    },

  },

  async created() {
    // The values of environment variables are currently not loaded in components in production TODO: investigate why and find a fix.
    localStorage.setItem(localStorageKeys.googleMapsAPIKey.name, process.env.VITE_GOOGLE_API_KEY);
    localStorage.setItem(localStorageKeys.baseUrl.name, process.env.VITE_API_BASE_URL);
    sessionStorage.setItem(sessionStorageKeys.appVersion.name, process.env.VITE_VERSION);

    if (window.Cypress) {
      initializeStores();
    }

    this.createPrototypes();

    this.subscribeSignalR();

    // The access token will be refreshed automatically every 5 minutes..
    AuthenticationProvider.startAccessTokenAutoRenewal(60000 * 5);

    // Create a infinite loop, probably because some refreshes happen will loading the app
    // this.listenToRefreshAndKeepFeatureBranch();
  },

  methods: {
    createPrototypes() {
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
        // we only show one message box at a time.
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

      Vue.prototype.$reportToasted = (message, error) => {
        setTimeout(
          () => {
            this.lastErrorTime = new Date().getTime();
            this.errorToastMessage = message;
            this.showReportToast = true;
            this.toastError = error;
          },
          1500,
        );
      };
    },

    async subscribeSignalR() {
      await helpers.timeout(this.waitBeforeSignalRSubscriptions);
      setInterval(() => {
        this.$signalR.updateSubscriptions();
      }, this.intervalSignalRSubscriptions);
    },

    listenToRefreshAndKeepFeatureBranch() {
      document.addEventListener('DOMContentLoaded', () => {
        const branchId = process.env.VITE_TEMP_BRANCH_ID;
        const currentUrl = window.location.href;
        // Check if the URL already has a query string
        const separator = currentUrl.includes('?') ? '&' : '?';

        const newUrl = `${currentUrl}${separator}fb=${branchId}`;
        window.location.href = newUrl;
      });
    },
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

$url-logo: "../../img/logo.png";
$url-rc-en-logo: "../img/logos/rc/rc-en.svg";
$url-rc-fr-logo: "../../img/logos/rc/rc-fr.svg";

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
