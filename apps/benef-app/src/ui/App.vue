<template>
  <v-app>
    <router-view />

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
import Vue from 'vue';
import { localStorageKeys } from '@/constants/localStorage';
import { sessionStorageKeys } from '@/constants/sessionStorage';
import { RcConfirmationDialog, RcErrorDialog } from '@libs/component-lib/components';
import sanitizeHtml from 'sanitize-html';

export default {
  name: 'App',

  components: {
    RcConfirmationDialog,
    RcErrorDialog,
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

  async created() {
    // The values of environment variables are currently not loaded in components in production ?! :)
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

    this.createPrototypes();
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
    },
  },
};
</script>
