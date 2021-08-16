<template>
  <ValidationObserver ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="title"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.apply')"
      :submit-button-disabled="failed"

      :persistent="true"
      :show-help="true"
      :help-link="helpLink"
      :tooltip-label="$t('common.tooltip_label')"
      @cancel="$emit('cancelChange')"
      @close="$emit('cancelChange')"
      @submit="onSubmit">
      <div class="pa-0">
        <v-col
          cols="12"
          class=" mb-8 pa-3 border-radius-all"
          :style="backgroundColor">
          <status-chip status-name="CaseFileStatus" :status="toStatus" data-test="case-file-summary-status-chip" />
          <span v-if="user && user.metadata" class="pl-1 rc-body14"> by {{ user.metadata.displayName }} ({{ $m(user.metadata.roleName) }})</span>
        </v-col>

        <v-select-with-validation
          v-if="reasonIncluded"
          v-model="selectedReason"
          data-test="reason"

          :label="`${toStatus == CaseFileStatus.Closed ? $t('caseFileDetails.reason.Closed') :$t('caseFileDetails.reason.Inactive') } *`"
          :items="reasons"
          :item-text="(item) => $m(item.name)"
          return-object
          :rules="rules.reason" />

        <v-text-field-with-validation
          v-if="selectedReason && selectedReason.isOther"
          v-model="specifiedOther"
          data-test="reason-specified-other"
          autocomplete="nope"
          :label="`${$t('common.pleaseSpecify')} *`"
          :rules="rules.specifiedOther" />

        <v-text-area-with-validation
          v-model="rationale"
          :label="`${$t('caseFile.changeStatusConfirm.Rationale')} ${rationaleRequired ? '*' : '' } `"

          class="full-width"
          :rules="rules.rationale" />
      </div>
    </rc-dialog>
  </ValidationObserver>
</template>

<script lang='ts'>
import Vue from 'vue';
import {
  RcDialog,
  VTextFieldWithValidation,
  VTextAreaWithValidation,
  VSelectWithValidation,
} from '@crctech/component-library';
import { VForm } from '@/types';
import { CaseFileStatus } from '@/entities/case-file';
import { IOptionItem } from '@/entities/optionItem';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { IUserAccountCombined } from '@/entities/user-account';
import colors from '@/ui/plugins/vuetify/colors';
import { MAX_LENGTH_MD } from '@/constants/validations';

export default Vue.extend({
  name: 'CaseFileStatusDialog',

  components: {
    RcDialog,
    StatusChip,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    VSelectWithValidation,
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
      selectedReason: null,
      rationale: null,
      specifiedOther: null,
      userId: null,
      CaseFileStatus,
      colors,
      titles: {
        [CaseFileStatus.Open]: this.$t('caseFile.changeStatusConfirmTitle.Open'),
        [CaseFileStatus.Closed]: this.$t('caseFile.changeStatusConfirmTitle.Close'),
        [CaseFileStatus.Inactive]: this.$t('caseFile.changeStatusConfirmTitle.Inactive'),
      } as Record<string, string>,
    };
  },
  computed: {
    title() : string {
      return this.titles[this.toStatus];
    },

    rationaleRequired() : boolean {
      return this.toStatus === CaseFileStatus.Closed || this.toStatus === CaseFileStatus.Open;
    },

    reasonIncluded() : boolean {
      return this.toStatus === CaseFileStatus.Closed || this.toStatus === CaseFileStatus.Inactive;
    },

    helpLink() : string {
      switch (this.toStatus) {
        case CaseFileStatus.Inactive: return this.$t('zendesk.help_link.change_caseFile_status_inactive') as string;
        case CaseFileStatus.Closed: return this.$t('zendesk.help_link.change_caseFile_status_closed') as string;
        case CaseFileStatus.Open: return this.$t('zendesk.help_link.change_caseFile_status_reopen') as string;
        default: return null;
      }
    },

    backgroundColor(): Record<string, unknown> {
      let color = colors.grey.lighten4;
      if (this.toStatus === CaseFileStatus.Open) color = colors.chips.green_pale;
      if (this.toStatus === CaseFileStatus.Closed) color = colors.chips.red_pale;
      return { backgroundColor: color };
    },

    user(): IUserAccountCombined {
      return this.$storage.userAccount.getters.get(this.userId);
    },

    rules(): Record<string, unknown> {
      return {
        reason: {
          required: this.reasonIncluded,
        },
        rationale: {
          required: this.rationaleRequired,
          max: MAX_LENGTH_MD,
        },
        specifiedOther: {
          required: true,
          max: MAX_LENGTH_MD,
        },
      };
    },

    reasons(): Array<IOptionItem> {
      let reasons;
      if (this.toStatus === CaseFileStatus.Inactive) {
        reasons = this.$storage.caseFile.getters.inactiveReasons();
      }

      if (this.toStatus === CaseFileStatus.Closed) {
        reasons = this.$storage.caseFile.getters.closeReasons();
      }

      return reasons;
    },

  },

  watch: {
    selectedReason() {
      if (!this.selectedReason || !this.selectedReason.isOther) {
        this.specifiedOther = null;
      }
    },
  },

  async created() {
    if (this.toStatus === CaseFileStatus.Inactive) {
      await this.$storage.caseFile.actions.fetchInactiveReasons();
    }

    if (this.toStatus === CaseFileStatus.Closed) {
      await this.$storage.caseFile.actions.fetchCloseReasons();
    }

    const userId = this.$storage.user.getters.userId();
    this.userId = userId;
    if (userId) {
      await this.$storage.userAccount.actions.fetch(userId);
    }
  },

  methods: {

    async onSubmit() {
      const reasonPayload = {
        OptionItemId: this.selectedReason ? this.selectedReason.id : null,
        SpecifiedOther: this.specifiedOther,
      };
      const rationalePayload = this.rationale ? this.rationale : null;
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.$emit('submit', { rationale: rationalePayload, reason: reasonPayload });
      }
    },
  },

});

</script>
