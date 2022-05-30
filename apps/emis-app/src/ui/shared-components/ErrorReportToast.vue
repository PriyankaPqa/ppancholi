<template>
  <div>
    <div v-if="show" ref="errorToast" class="error-toaster">
      <div ref="errorMessage" class="message-line">
        <div class="message">
          {{ message }}
        </div>
      </div>
    </div>
    <rc-dialog
      :show="showErrorReportDialog"
      data-test="error-report-dialog"
      :title="hasSupportAddress? $t('errorReport.reportProblem') : $t('errorReport.errorDialog.errorDetails')"
      :cancel-action-label="hasSupportAddress? $t('common.cancel'): $t('common.close')"
      :submit-action-label="$t('errorReport.errorDialog.sendReport')"
      :show-submit="hasSupportAddress"
      :persistent="true"
      :max-width="900"
      :min-height="hasSupportAddress? 480 : 300"
      :loading="loadingSubmit"
      @cancel="closeDialog"
      @close="closeDialog"
      @submit="submitReport">
      <v-sheet rounded class="error-data mb-6">
        <table class="rc-body14 px-4 py-1">
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
        v-model="description"
        :data-test="`error-report-description`"
        :label="$t('common.description')"
        rows="8" />
    </rc-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { format } from 'date-fns';
import _isEmpty from 'lodash/isEmpty';
import { RcDialog, VTextAreaWithValidation, RcTooltip } from '@libs/component-lib/components';
import { TranslateResult } from 'vue-i18n';
import { IServerError } from '@libs/core-lib/types';
import { IErrorReport } from '@/types';
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
      description: '',
      report: null as IErrorReport,
      showFullPayload: false,
    };
  },

  computed: {
    api(): string {
      return (this.error as IServerError)?.request?.responseURL || '';
    },

    callPayload(): unknown {
      try {
        const stringPayload = (this.error as IServerError).response?.config?.data;
        const payload = JSON.parse(stringPayload);
        return !_isEmpty(payload) ? payload : '';
      } catch {
        return '';
      }
    },

    errorType(): string | TranslateResult {
      return (this.error as IServerError).message;
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
    const element = this.$refs.errorToast as HTMLElement;

    const e = (this.$refs.errorToast as HTMLElement).outerHTML;
    this.toast = this.$toasted.global.errorReport(e);

    // Hide the created HTML that is moved inside the toaster
    element.classList.add('hide-error-toaster-html');
    (document.getElementsByClassName('hide-error-toaster-html')[0] as HTMLElement).style.display = 'none';

    this.addToastCloseButton();
    this.addToastReportButton();
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

      this.description = this.hasSupportAddress ? this.$t('errorReport.errorDialog.description.defaultContent') as string : '';
      this.makeReportPayload();
    },

    async submitReport() {
      try {
        this.loadingSubmit = true;
        this.report.description = this.description;
        await this.$services.errorReporting.sendErrorReport(this.report);
        this.$toasted.global.success(this.$t('errorReport.errorDialog.reportSentSuccess'));
        this.loadingSubmit = false;
        this.$emit('update:show', false);
      } catch (e) {
        this.$emit('update:show', false);
        this.$nextTick(() => {
          this.$reportToasted(this.$t('errorReport.errorDialog.reportSentFail'), e);
        });
      }
    },

    makeReportPayload() {
      const timeNow = new Date();

      this.report = {
        id: format(timeNow, 'yyyy-MM-dd_H:mm:ss'),
        user: this.$storage.user.getters.user(),
        timestamp: timeNow.toISOString(),
        api: this.api,
        status: (this.error as IServerError).response?.status,
        payload: this.stringifiedCallPayload,
        errorResponse: JSON.stringify((this.error as IServerError).response, null, 2),
        description: this.description,
        appUrl: this.$route.fullPath,
        tenantId: this.tenantId,
        languageCode: this.languageCode,
      };
    },

    copyErrorData() {
      // Replace the stringified properties by the corresponding objects, in order to be well displayed when the whole report is stringified
      const copiedReport = this.report;
      copiedReport.payload = this.callPayload;
      copiedReport.errorResponse = (this.error as IServerError).response;

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
