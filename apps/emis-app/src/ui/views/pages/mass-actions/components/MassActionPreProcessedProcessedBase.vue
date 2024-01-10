<template>
  <v-row justify="center" class="pt-12">
    <v-col cols="12" md="8" xl="7" sm="12" tabindex="0">
      <mass-action-title-description
        v-if="!editMode"
        :show-delete-icon="showDeleteIcon"
        :show-edit-icon="showEditIcon"
        :loading-chip="false"
        :mass-action="massAction"
        :mass-action-status="massActionStatus"
        @edit="editMode = true"
        @delete="onDelete()" />

      <mass-action-edit-title-description
        v-else
        :disable-name="disableName"
        :mass-action="massAction"
        :mass-action-status="massActionStatus"
        @cancel="editMode = false"
        @update="update($event)" />

      <div class="mt-12">
        <v-row no-gutters class="row-data">
          <v-col cols="12" md="5">
            <span class="rc-body14 fw-bold" data-test="totalLabel">{{ $t(totalLabel) }}</span>
          </v-col>
          <v-col md="2">
            <span class="rc-body14" data-test="total">{{ total }}</span>
          </v-col>
          <v-col v-if="isFinancial" md="4">
            <span class="rc-body14" data-test="projectedAmount">{{ $formatCurrency(projectedAmount) }}</span>
          </v-col>
        </v-row>

        <v-row no-gutters :class="[isPreprocessed ? 'rc-green-background' : '', 'row-data']">
          <v-col cols="12" md="5">
            <span class="rc-body14 fw-bold green-text" data-test="successesLabel=">
              <v-icon class="mr-2" small :color="colors.status.success">mdi-check-circle</v-icon>
              {{ $t(successesLabel) }}
            </span>
          </v-col>
          <v-col md="2">
            <span class="rc-body14" data-test="successes">{{ successes }}</span>
          </v-col>
          <v-col md="4">
            <span v-if="isFinancial" class="rc-body14" data-test="successesAmount">{{ $formatCurrency(successesAmount) }}</span>
          </v-col>
          <v-col md="1" class="d-flex justify-end">
            <v-btn
              v-if="showProcessButton && !isProcessed"
              data-test="processButton"
              :disabled="successes === 0"
              small
              color="primary"
              @click="onProcess()">
              {{ $t('massAction.process.button.label') }}
            </v-btn>
            <v-btn
              v-if="showValidDownloadButton && isProcessed"
              data-test="validDownloadButton"
              :disabled="successes === 0"
              small
              color="primary"
              @click="downloadValid()">
              {{ $t('massAction.download.button.label') }}
            </v-btn>
          </v-col>
        </v-row>

        <v-row no-gutters :class="[isPreprocessed ? 'rc-red-background' : '', 'row-data']">
          <v-row no-gutters :class="[showErrors ? 'mt-4' : '', 'full-width']">
            <v-col cols="12" md="5">
              <span class="rc-body14 fw-bold red-text">
                <v-icon class="mr-2" small :color="colors.status.error">mdi-alert-circle</v-icon>
                {{ $t(failuresLabel) }}
              </span>
            </v-col>
            <v-col md="5">
              <span class="rc-body14" data-test="failures">
                {{ failures }}
              </span>
            </v-col>
            <v-col md="2" class="d-flex justify-end">
              <template v-if="hasErrors">
                <v-btn icon class="mr-2" :aria-label="$t('common.buttons.expand')" small @click="showErrors = !showErrors">
                  <v-icon>{{ showErrors ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>

                <v-divider vertical class="mr-5" />
              </template>

              <v-btn
                v-if="showInvalidDownloadButton"
                data-test="invalidDownloadButton"
                :disabled="!hasFailures"
                small
                color="primary"
                @click="downloadInvalid()">
                {{ $t('massAction.download.button.label') }}
              </v-btn>
            </v-col>
          </v-row>

          <div v-if="showErrors" class="full-width">
            <v-row v-for="(item, index) in massActionMetadata.lastRun.errors" :key="index" no-gutters>
              <v-col cols="12" md="5" class="pl-7 mb-2 pr-12">
                <span class="rc-body14">{{ $te(`errors.${item.error}-mass-action`)
                  ? $t(`errors.${item.error}-mass-action`)
                  : $t(`errors.${item.error}`) }}</span>
              </v-col>
              <v-col class="pl-n7">
                <span class="rc-body14">{{ $t(item.total) }}</span>
              </v-col>
            </v-row>
          </div>
        </v-row>
      </div>

      <mass-action-details-table :mass-action="massAction" class="mt-12" />

      <slot name="preprocessing" />

      <div class="mt-6">
        <slot name="payment-details" />
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  IMassActionEntity, IMassActionMetadata, MassActionRunStatus, MassActionRunType, MassActionType,
} from '@libs/entities-lib/mass-action';
import MassActionDetailsTable from '@/ui/views/pages/mass-actions/components/MassActionDetailsTable.vue';
import MassActionTitleDescription from '@/ui/views/pages/mass-actions/components/MassActionTitleDescription.vue';
import colors from '@libs/shared-lib/plugins/vuetify/colors';

import MassActionEditTitleDescription from '@/ui/views/pages/mass-actions/components/MassActionEditTitleDescription.vue';
import helpers from '@/ui/helpers/helpers';
import { useMassActionStore } from '@/pinia/mass-action/mass-action';
import { IServerError } from '@libs/shared-lib/types';

export default Vue.extend({
  name: 'MassActionPreProcessedProcessedBase',
  components: {
    MassActionDetailsTable,
    MassActionTitleDescription,
    MassActionEditTitleDescription,
  },

  props: {
    massAction: {
      type: Object as () => IMassActionEntity,
      required: true,
    },

    massActionStatus: {
      type: Number,
      required: true,
    },

    total: {
      type: Number,
      required: true,
    },

    projectedAmount: {
      type: Number,
      default: 0,
    },

    successes: {
      type: Number,
      required: true,
    },

    failures: {
      type: Number,
      required: true,
    },

    totalLabel: {
      type: String,
      required: true,
    },

    successesLabel: {
      type: String,
      required: true,
    },

    successesAmount: {
      type: Number,
      default: 0,
    },

    failuresLabel: {
      type: String,
      required: true,
    },

    showProcessButton: {
      type: Boolean,
      default: false,
    },

    showInvalidDownloadButton: {
      type: Boolean,
      default: false,
    },

    showValidDownloadButton: {
      type: Boolean,
      default: false,
    },

    showDeleteIcon: {
      type: Boolean,
      default: false,
    },

    showEditIcon: {
      type: Boolean,
      default: false,
    },

    disableName: {
      type: Boolean,
      default: false,
    },

    massActionMetadata: {
      type: Object as () =>IMassActionMetadata,
      required: true,
    },
  },

  data() {
    return {
      colors,
      showErrors: false,
      editMode: false,
    };
  },

  computed: {
    hasErrors(): boolean {
      return this.massActionMetadata.lastRun.errors.length > 0;
    },

    hasFailures(): boolean {
      return this.massActionMetadata.lastRun.results?.failures > 0;
    },

    isPreprocessed(): boolean {
      return this.massActionMetadata.lastRun.runStatus === MassActionRunStatus.PreProcessed;
    },

    isProcessed(): boolean {
      return this.massActionMetadata.lastRun.runStatus === MassActionRunStatus.Processed;
    },

    isFinancial(): boolean {
      return this.massAction.type === MassActionType.FinancialAssistance;
    },
  },

  async mounted() {
    this.showErrors = !this.isPreprocessed;
  },

   methods: {
    async update(payload: { name: string; description: string }) {
      this.editMode = false;

      try {
        const res = await useMassActionStore().update(this.massAction.id, payload);
        if (res) {
          this.$toasted.global.success(this.$t('massAction.update.success'));
        }
      } catch (error) {
        this.handleResponseError(error as IServerError);
      }
    },

    async onProcess() {
      const userChoice = await this.$confirm({
        title: this.$t('massAction.confirm.processing.title'),
        messages: this.$t('massAction.confirm.processing.message'),
      });
      if (userChoice) {
        try {
          await useMassActionStore().process(this.massAction.id, MassActionRunType.Process);
        } catch (error) {
          this.handleResponseError(error as IServerError);
        }
      }
    },

    async onDelete() {
      const userChoice = await this.$confirm({
        title: this.$t('massAction.confirm.delete.title'),
        messages: this.$t('massAction.confirm.delete.message'),
      });
      if (userChoice) {
        try {
          const res = await useMassActionStore().deactivate(this.massAction.id);
          if (res) {
            this.$emit('delete:success');
            this.$toasted.global.success(this.$t('massAction.delete.success'));
          }
        } catch (error) {
          this.handleResponseError(error as IServerError);
        }
      }
    },

    async downloadInvalid() {
      try {
      const res = await this.$services.massActions.getInvalidFile({
        massActionId: this.massAction.id,
        runId: this.massActionMetadata.lastRun.runId,
        language: this.$i18n.locale,
      });
        if (res) {
        helpers.downloadFile(res, `${this.massAction.name}.invalid.csv`);
        }
      } catch (error) {
        this.handleResponseError(error as IServerError);
      }
    },

    async downloadValid() {
      const res = await this.$services.massActions.getValidFile({
        massActionId: this.massAction.id,
        runId: this.massActionMetadata.lastRun.runId,
        language: this.$i18n.locale,
        massActionType: this.massAction.type,
      });
      if (res) {
        helpers.downloadFile(res, `${this.massAction.name}.valid.csv`);
      }
    },

    handleResponseError(error: IServerError) {
      if (error.response?.status === 403) {
        this.$toasted.global.error(this.$t('massAction.processing.error.noPermission'));
      } else {
        const errorData = error.response?.data?.errors;
         if (!errorData || !Array.isArray(errorData)) {
          this.$reportToasted(this.$t('error.submit_error'), error);
        } else {
          errorData.forEach((error) => {
            if (this.$te(error.code)) {
              this.$toasted.global.error(this.$t(error.code));
            } else {
              this.$reportToasted(this.$t('error.submit_error'), error);
            }
          });
        }
      }
    },
  },
});
</script>

<style lang="scss" scoped>

.green-text {
  color: var(--v-status_success-base);
}

.red-text {
  color:  var(--v-status_error-base);
}

.row-data {
  min-height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border: solid var(--v-grey-lighten2);
  border-width: 1px 1px 0px 1px;

}

.row-data:last-child {
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-width: 1px 1px 1px 1px;
}

.row-data:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-width: 1px 1px 0px 1px;
}

.row-data:only-child {
  border-width: 1px 1px 1px 1px;
}

</style>
