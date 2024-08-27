<template>
  <v-row justify="center" class="pt-12">
    <v-col cols="12" md="8" xl="7" sm="12" tabindex="0">
      <mass-action-title-description
        :show-delete-icon="isFailedPreprocessing"
        :loading-chip="false"
        :mass-action="massAction"
        :mass-action-status="massActionStatus"
        @delete="onDelete()" />

      <v-row no-gutters class="message-container mt-6">
        <v-col cols="12" class="mt-12 mb-12 d-flex flex-column align-center">
          <v-icon size="60" color="red" class="mb-4">
            mdi-information-outline
          </v-icon>
          <p v-if="isFailedPreprocessing" class="rc-body16 fw-bold red-text" data-test="pre-failed-title">
            {{ $t('massAction.preprocessing.error.failed') }}
          </p>
          <p v-else class="rc-body16 fw-bold red-text" data-test="proc-failed-title">
            {{ $t('massAction.processing.error.failed') }}
          </p>
          <p v-if="isFailedPreprocessing" class="mb-0" data-test="pre-failed-msg-1">
            {{ $t('massAction.preprocessing.error.failed.message.1') }}
          </p>
          <p v-else class="mb-0" data-test="proc-failed-msg-1">
            {{ $t('massAction.processing.error.failed.message.1') }}
          </p>
          <p v-if="isFailedPreprocessing" data-test="pre-failed-msg-2">
            {{ $t('massAction.preprocessing.error.failed.message.2') }}
          </p>
          <p v-else data-test="proc-failed-msg-2">
            {{ $t('massAction.processing.error.failed.message.2') }}
          </p>
        </v-col>
      </v-row>

      <mass-action-details-table :mass-action="massAction" class="mt-12" />

      <div class="mt-6">
        <slot name="payment-details" />
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { IMassActionEntity, MassActionRunStatus } from '@libs/entities-lib/mass-action';
import MassActionDetailsTable from '@/ui/views/pages/mass-actions/components/MassActionDetailsTable.vue';
import MassActionTitleDescription from '@/ui/views/pages/mass-actions/components/MassActionTitleDescription.vue';

import { useMassActionStore } from '@/pinia/mass-action/mass-action';
import { IServerError } from '@libs/shared-lib/types';

export default Vue.extend({
  name: 'MassActionFailedBase',
  components: {
    MassActionDetailsTable,
    MassActionTitleDescription,
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
  },

  computed: {
    isFailedPreprocessing(): boolean {
      return this.massActionStatus === MassActionRunStatus.FailedPreProcessing;
    },
  },

  methods: {

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

.red-text {
  color:  var(--v-status_error-base);
}

.message-container {
  border: solid var(--v-grey-lighten2);
  border-width: 1px;
  border-radius: 4px;
}

</style>
