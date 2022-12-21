<template>
  <div>
    <div v-if="show" ref="errorToast" class="error-toaster">
      <div ref="errorMessage" class="message-line">
        <div class="message">
          {{ message }}
        </div>
      </div>
    </div>
    <validation-observer ref="form" v-slot="{ failed }" slim>
      <rc-dialog
        :show="showErrorReportDialog"
        data-test="error-report-dialog"
        :title="hasSupportAddress ? $t('errorReport.reportProblem') : $t('errorReport.errorDialog.errorDetails')"
        :cancel-action-label="hasSupportAddress ? $t('common.cancel') : $t('common.close')"
        :submit-action-label="$t('errorReport.errorDialog.sendReport')"
        :show-submit="hasSupportAddress"
        :submit-button-disabled="failed"
        :persistent="true"
        :max-width="900"
        :min-height="hasSupportAddress ? 480 : 300"
        :loading="loadingSubmit"
        @cancel="closeDialog"
        @close="closeDialog"
        @submit="submitReport">
        <v-sheet rounded class="error-data mb-6">
          <table class="rc-body14 px-4 py-1 full-width">
            <tbody>
              <tr>
                <td class="error-data-cell error-data-title">
                  {{ $t('errorReport.errorDialog.errorMessage') }}
                </td>
                <td class="error-data-cell error-data-content d-flex flex-row justify-space-between align-start">
                  <div>
                    {{ message }}
                  </div>
                  <div>
                    <rc-tooltip bottom>
                      <template #activator="{ on }">
                        <v-btn class="copy-btn" icon bottom v-on="on" @click="copyErrorData">
                          <v-icon size="24" color="grey darken-2">
                            mdi-content-copy
                          </v-icon>
                        </v-btn>
                      </template>
                      <span>{{ $t('errorReport.errorDialog.copyData') }}</span>
                    </rc-tooltip>
                  </div>
                </td>
              </tr>
              <tr v-if="errorType">
                <td class="error-data-cell error-data-title">
                  {{ $t('errorReport.errorDialog.errorType') }}
                </td>
                <td class="error-data-cell error-data-content">
                  {{ errorType }}
                </td>
              </tr>
              <tr v-if="api">
                <td class="error-data-cell error-data-title">
                  {{ $t('errorReport.errorDialog.api') }}
                </td>
                <td class="error-data-cell error-data-content">
                  {{ api }}
                </td>
              </tr>
              <tr v-if="callPayload">
                <td class="error-data-cell error-data-title">
                  {{ $t('errorReport.errorDialog.callPayload') }}
                </td>
                <td class="error-data-cell error-data-content">
                  <div :style="`maxHeight:${payloadMaxHeight}; overflow:hidden;`">
                    <pre class="error-data-payload">{{ callPayload }}</pre>
                  </div>
                  <span v-if="!showFullPayload" class="pl-4">.....</span>
                  <v-btn
                    small
                    width="fit-content"
                    @click="showFullPayload = !showFullPayload">
                    {{ payloadToggleText }}
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </table>
        </v-sheet>
        <v-text-area-with-validation
          v-if="hasSupportAddress"
          v-model="descriptionDoing"
          :rules="rules.description"
          :data-test="`error-report-description`"
          :label="`${$t('errorReport.errorDialog.description.doing')} *`"
          rows="3" />
        <v-text-area-with-validation
          v-if="hasSupportAddress"
          v-model="descriptionExpected"
          :rules="rules.description"
          :data-test="`error-report-description`"
          :label="`${$t('errorReport.errorDialog.description.expected')} *`"
          rows="3" />
        <v-text-area-with-validation
          v-if="hasSupportAddress"
          v-model="descriptionHappened"
          :rules="rules.description"
          :data-test="`error-report-description`"
          :label="`${$t('errorReport.errorDialog.description.happened')} *`"
          rows="3" />
      </rc-dialog>
    </validation-observer>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */

import Vue from 'vue';
import { format } from 'date-fns';
import _isEmpty from 'lodash/isEmpty';
import { RcDialog, VTextAreaWithValidation, RcTooltip } from '@libs/component-lib/components';
import { TranslateResult } from 'vue-i18n';
import { IServerError, IErrorReport, VForm } from '@libs/shared-lib/types';
import { MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import { useUserStore } from '@/pinia/user/user';
import helpers from '../helpers/helpers';

export default Vue.extend({
  name: 'ErrorReportToast',

  components: {
    RcDialog,
    VTextAreaWithValidation,
    RcTooltip,
  },

  props: {
    message: {
      type: String,
      default: '',
    },

    show: {
      type: Boolean,
      required: true,
    },

    error: {
      type: [Object as () => IServerError, Error],
      default: null,
    },

  },

  data() {
    return {
      showErrorReportDialog: false,
      loadingSubmit: false,
      toast: null,
      report: null as IErrorReport,
      showFullPayload: false,
      descriptionDoing: '',
      descriptionExpected: '',
      descriptionHappened: '',
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        description: {
          required: true,
          max: MAX_LENGTH_LG,
        },
      };
    },

    serverError(): IServerError {
      return (this.error as IServerError);
    },

    api(): string {
      return this.serverError?.request?.responseURL || (this.error as any)?.config?.url || '';
    },

    callPayload(): unknown {
      try {
        const stringPayload = this.serverError.response?.config?.data || (this.error as any)?.config?.data;
        const payload = JSON.parse(stringPayload);
        return !_isEmpty(payload) ? payload : '';
      } catch {
        return '';
      }
    },

    errorType(): string | TranslateResult {
      return this.serverError.message;
    },

    hasSupportAddress(): boolean {
      return !!this.$store.state.tenantSettingsEntities.currentTenantSettings?.supportEmails?.translation?.[this.languageCode];
    },

    languageCode(): string {
      return this.$i18n.locale;
    },

    payloadMaxHeight(): string {
      return this.showFullPayload ? 'none' : '50px';
    },

    payloadToggleText(): TranslateResult {
      return this.showFullPayload ? this.$t('errorReport.errorDialog.hidePayload') : this.$t('errorReport.errorDialog.showPayload');
    },

    stringifiedCallPayload(): string {
      return JSON.stringify(this.callPayload, null, 2);
    },

    tenantId(): string {
      return this.$store.state.tenantSettingsEntities.currentTenantSettings.tenantId;
    },
  },

  mounted() {
    if (!this.api && !this.serverError.response?.status && !this.callPayload) {
      this.closeDialog();
      return;
    }

    const element = this.$refs.errorToast as HTMLElement;

    const e = (this.$refs.errorToast as HTMLElement).outerHTML;
    this.toast = this.$toasted.global.errorReport(e);

    // Hide the created HTML that is moved inside the toaster
    element.classList.add('hide-error-toaster-html');
    (document.getElementsByClassName('hide-error-toaster-html')[0] as HTMLElement).style.display = 'none';

    this.addToastCloseButton();

    if (window.navigator.onLine) {
      this.addToastReportButton();
    }
  },

  methods: {
    addToastReportButton() {
      const report = document.createElement('button');
      report.innerHTML = this.hasSupportAddress ? this.$t('errorReport.reportProblem') as string : this.$t('errorReport.errorDialog.errorDetails') as string;
      report.className = 'v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--small report-error-btn';

      report.addEventListener('click', () => this.initReport());

      this.toast.el.appendChild(report);
    },

    addToastCloseButton() {
      const close = document.createElement('button');
      close.className = 'close-btn action';
      const icon = document.createElement('i');
      icon.className = 'mdi mdi-close';
      close.appendChild(icon);

      close.addEventListener('click', () => {
        this.toast.goAway(0);
        this.$emit('update:show', false);
      });

      this.toast.el.querySelector('.message-line').appendChild(close);
    },

    closeDialog() {
      this.showErrorReportDialog = false;
      this.$emit('update:show', false);
    },

    initReport() {
      this.toast.goAway(0);
      this.showErrorReportDialog = true;

      this.makeReportPayload();
    },

    async submitReport() {
      try {
        const isValid = await (this.$refs.form as VForm).validate();
        if (isValid) {
          this.loadingSubmit = true;
          this.report.description = this.makeDescription();

          await this.$services.errorReporting.sendErrorReport(this.report);
          this.$appInsights.trackTrace('Sending report', { payload: this.report }, 'ErrorRepostToast', 'submitReport');
          this.$toasted.global.success(this.$t('errorReport.errorDialog.reportSentSuccess'));
          this.loadingSubmit = false;
          this.$emit('update:show', false);
        }
      } catch (e) {
        this.$emit('update:show', false);
        this.$nextTick(() => {
          this.$appInsights.trackException(e, {}, 'ErrorRepostToast', 'submitReport');
          this.$reportToasted(this.$t('errorReport.errorDialog.reportSentFail'), e);
        });
      }
    },

    makeReportPayload() {
      const timeNow = new Date();

      this.report = {
        id: format(timeNow, 'yyyy-MM-dd_H:mm:ss'),
        user: useUserStore().getUser(),
        timestamp: timeNow.toISOString(),
        api: this.api,
        status: this.serverError.response?.status,
        payload: this.stringifiedCallPayload,
        errorResponse: JSON.stringify(this.serverError.response, null, 2),
        description: this.errorType ? JSON.stringify(this.errorType) : '',
        appUrl: this.$route.fullPath,
        tenantId: this.tenantId,
        languageCode: this.languageCode,
      };
    },

    makeDescription():string {
      return `${this.$t('errorReport.errorDialog.description.doing')} ${this.descriptionDoing}\n`
      + `${this.$t('errorReport.errorDialog.description.expected')} ${this.descriptionExpected}\n`
      + `${this.$t('errorReport.errorDialog.description.happened')} ${this.descriptionHappened}`;
    },

    copyErrorData() {
      // Replace the stringified properties by the corresponding objects, in order to be well displayed when the whole report is stringified
      const copiedReport = this.report;
      copiedReport.payload = this.callPayload;
      copiedReport.errorResponse = this.serverError.response;

      const stringifiedReport = JSON.stringify(copiedReport, null, 2);
      helpers.copyToClipBoard(stringifiedReport);
      this.$toasted.global.success(this.$t('errorReport.errorDialog.dataCopied'));
    },
  },

});
</script>

<style scoped lang="scss">

.message-line {
    display: flex;
    justify-items: space-around;
    align-items: flex-start;
}

.message {
  margin-right: 16px;
}

.copy-btn {
  margin-right: -6px;
}

::v-deep .v-textarea {
    font-size: 14px;
  }

  .error-data {
    border-style: solid;
    border-color: var(--v-grey-lighten5);
    background-color:  rgb(255 230 230);

    .error-data-cell{
      vertical-align: top;
      color: var(--v-status_error-base);
     }
     .error-data-title {
       width: 25%;
       font-weight: bold;
     }

     .error-data-content {
       display: flex;
       flex-direction: column;
       word-break: break-word;
     }

    .error-data-payload {
      white-space: break-spaces;
    }

  }

</style>

<style lang="scss">

.toasted.emis-toast-error-report .report-error-btn {
  margin-top: 12px;
  padding: 8px;
  height: 26px !important;
  background-color: var(--v-primary-base) !important;
  font-weight: bold;
  color: var(--v-white-base) !important;
}

.toasted.emis-toast-error-report {
  display: flex;
  flex-direction:column;
  padding: 12px !important;
  align-items: flex-start !important;
  max-width: 500px;
  line-height: 1.5em;
}

.toasted-container .toasted.emis-toast-error-report .action.close-btn  {
  margin: 0;
  padding: 0;
  .mdi {
    margin: 0;
  }
}
</style>
