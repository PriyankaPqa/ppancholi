<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="title"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.save')"
      :submit-button-disabled="failed || loading"
      :content-only-scrolling="true"
      :persistent="true"
      :show-help="false"
      :tooltip-label="$t('common.tooltip_label')"
      :max-width="750"
      content-padding="5"
      data-test="impacted-individual-rationale-dialog"
      @cancel="$emit('close');"
      @close="$emit('close');"
      @submit="onSubmit">
      <div class="px-16 mx-8 overflow-hidden">
        <v-col
          cols="12"
          class=" mt-2 mb-8 pa-4 border-radius-all background-color rc-body14"
          data-test="impacted-individual-rationale-dialog-user-date">
          <span class="font-weight-bold">
            {{ isReceivingAssistanceChangeTo
              ? $t('impactedIndividuals.remove_member_from_receiving_assistance.actioned_by')
              : $t('impactedIndividuals.remove_member_from_receiving_assistance.removed_by') }}
          </span>
          <span>{{ `${userInfo} - ${format(new Date(), 'PP')}` }}</span>
        </v-col>

        <v-text-area-with-validation
          v-model="rationale"
          rows="2"
          :label="`${$t('impactedIndividuals.rationale')} *`"
          class="full-width"
          :rules="rules.rationale"
          data-test="impacted-individual-rationale-dialog-rationale" />
      </div>
    </rc-dialog>
  </validation-observer>
</template>

<script lang='ts'>
import Vue from 'vue';
import {
  RcDialog,
  VTextAreaWithValidation,
} from '@libs/component-lib/components';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { HouseholdStatus } from '@libs/entities-lib/household';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { useUserStore } from '@/pinia/user/user';
import { VForm } from '@libs/shared-lib/types';
import { TranslateResult } from 'vue-i18n';
import { format } from 'date-fns';

export default Vue.extend({
  name: 'ImpactedIndividualsRequireRationaleDialog',

  components: {
    RcDialog,
    VTextAreaWithValidation,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    personId: {
      type: String,
      required: true,
    },
    caseFileId: {
      type: String,
      required: true,
    },
    isReceivingAssistanceChangeTo: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      format,
      rationale: null,
      HouseholdStatus,
      loading: false,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        rationale: {
          required: true,
          max: MAX_LENGTH_MD,
        },
      };
    },

    userAccountMetadata(): IUserAccountMetadata {
      return useUserAccountMetadataStore().getById(useUserStore().getUserId());
    },

    userInfo(): string {
      return `${this.userAccountMetadata.displayName} (${this.$m(this.userAccountMetadata.roleName)})`;
    },

    title(): TranslateResult {
      return this.isReceivingAssistanceChangeTo
        ? this.$t('impactedIndividuals.remove_member_from_receiving_assistance.title.receiving_assistance')
        : this.$t('impactedIndividuals.remove_member_from_receiving_assistance.title.not_receiving_assistance');
    },
  },

  methods: {
    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.loading = true;
        const params = {
          receiveAssistance: this.isReceivingAssistanceChangeTo,
          personId: this.personId,
          rationale: this.rationale,
        };
        const res = await this.$services.caseFiles.setPersonReceiveAssistance(this.caseFileId, params);
        if (res) {
          this.$emit('update:show', false);
        }
      }
    },
  },

});

</script>

<style lang="scss" scoped>
.background-color {
  background-color: var(--v-status_yellow_pale-base);
}
</style>
