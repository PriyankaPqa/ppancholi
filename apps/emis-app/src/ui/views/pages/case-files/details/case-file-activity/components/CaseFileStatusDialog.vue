<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="title"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.apply')"
      :submit-button-disabled="failed"
      :persistent="true"
      :show-help="false"
      :help-link="helpLink"
      :tooltip-label="$t('common.tooltip_label')"
      :max-width="750"
      @cancel="$emit('cancelChange')"
      @close="$emit('cancelChange')"
      @submit="onSubmit">
      <div class="pa-0">
        <v-col
          cols="12"
          class=" mb-8 pa-3 border-radius-all"
          :style="backgroundColor">
          <status-chip status-name="CaseFileStatus" :status="toStatus" data-test="case-file-summary-status-chip" />
          <span v-if="user && userMetadata" class="pl-1 rc-body14"> by {{ userMetadata.displayName }} ({{ $m(userMetadata.roleName) }})</span>
        </v-col>

        <v-select-with-validation
          v-if="reasonIncluded"
          v-model="selectedReason"
          data-test="reason"

          :label="`${toStatus == CaseFileStatus.Closed ? $t('caseFileDetails.reason.Closed') : $t('caseFileDetails.reason.Inactive') } *`"
          :items="reasons"
          :item-text="(item) => $m(item.name)"
          return-object
          :rules="rules.reason" />

        <v-text-field-with-validation
          v-if="selectedReason && selectedReason.isOther"
          v-model="specifiedOther"
          data-test="reason-specified-other"
          autocomplete="off"
          :label="`${$t('common.pleaseSpecify')} *`"
          :rules="rules.specifiedOther" />

        <v-text-area-with-validation
          v-model="rationale"
          :label="`${$t('caseFile.changeStatusConfirm.Rationale')} ${rationaleRequired ? '*' : '' } `"

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
  VTextAreaWithValidation,
  VSelectWithValidation,
} from '@libs/component-lib/components';
import { VForm } from '@libs/shared-lib/types';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import {
 IUserAccountEntity, IUserAccountMetadata,
} from '@libs/entities-lib/user-account';
import colors from '@libs/shared-lib/plugins/vuetify/colors';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { useUserStore } from '@/pinia/user/user';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import { useUserAccountMetadataStore, useUserAccountStore } from '@/pinia/user-account/user-account';

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
      if (this.toStatus === CaseFileStatus.Open) {
        color = colors.chips.green_pale;
      }
      if (this.toStatus === CaseFileStatus.Closed) {
        color = colors.chips.red_pale;
      }
      return { backgroundColor: color };
    },

    user(): IUserAccountEntity {
      return useUserAccountStore().getById(this.userId);
    },

    userMetadata(): IUserAccountMetadata {
      return useUserAccountMetadataStore().getById(this.userId);
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
        reasons = useCaseFileStore().getInactiveReasons();
      }

      if (this.toStatus === CaseFileStatus.Closed) {
        reasons = useCaseFileStore().getCloseReasons();
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
      await useCaseFileStore().fetchInactiveReasons();
    }

    if (this.toStatus === CaseFileStatus.Closed) {
      await useCaseFileStore().fetchCloseReasons();
    }

    const userId = useUserStore().getUserId();
    this.userId = userId;
    if (userId) {
      await useUserAccountStore().fetch(userId);
      await useUserAccountMetadataStore().fetch(userId, false);
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
