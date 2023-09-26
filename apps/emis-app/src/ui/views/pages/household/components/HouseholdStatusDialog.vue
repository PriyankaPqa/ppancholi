<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="title"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.apply')"
      :submit-button-disabled="failed"
      :content-only-scrolling="true"
      :persistent="true"
      :show-help="false"
      :help-link="$t('zendesk.help_link.change_event_status')"
      :tooltip-label="$t('common.tooltip_label')"
      :max-width="750"
      data-test="household-status-dialog"
      @cancel="$emit('update:show', false);"
      @close="$emit('update:show', false);"
      @submit="onSubmit">
      <div class="pa-0">
        <v-col
          cols="12"
          class=" mb-8 pa-3 border-radius-all status_display_background">
          <status-chip status-name="HouseholdStatus" :status="toStatus" data-test="household-status-chip" />
          <span data-test="user-info">
            {{ statusChangedBy }}
          </span>
        </v-col>

        <v-text-field-with-validation
          v-model="rationale"
          data-test="input-rationale"
          :label="`${$t('household.status.confirmation.rationale')} *`"
          class="full-width"
          :rules="rules.rationale" />
      </div>
    </rc-dialog>
  </validation-observer>
</template>

<script lang='ts'>
import Vue from 'vue';
import {
  RcDialog,
  VTextFieldWithValidation,
} from '@libs/component-lib/components';
import { VForm } from '@libs/shared-lib/types';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { HouseholdStatus } from '@libs/entities-lib/household';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { useUserStore } from '@/pinia/user/user';
import { TranslateResult } from 'vue-i18n';

export default Vue.extend({
  name: 'HouseholdStatusDialog',

  components: {
    RcDialog,
    StatusChip,
    VTextFieldWithValidation,
  },

  props: {
    toStatus: {
      type: Number,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      rationale: null,
      HouseholdStatus,
    };
  },

  computed: {
    title() : TranslateResult {
      return this.$t(`household.status.confirmation.title.${HouseholdStatus[this.toStatus]}`);
    },

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

    statusChangedBy(): string {
      return `${this.$t('household.status.confirmation.changed_by')} ${this.userAccountMetadata.displayName} (${this.$m(this.userAccountMetadata.roleName)})`;
    },
  },

  methods: {
    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.$emit('submit', { status: this.toStatus, rationale: this.rationale });
      }
    },
  },

});

</script>

<style lang="scss" scoped>
  .status_display_background {
    background: var(--v-grey-lighten5);
  }
</style>
