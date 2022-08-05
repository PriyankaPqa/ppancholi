<template>
  <div>
    <status-select
      data-test="case-file-detail-status-select"
      :value="caseFile.entity.caseFileStatus"
      :statuses="statuses"
      :disabled="disableStatus"
      status-name="CaseFileStatus"
      @input="onStatusChangeInit($event)" />

    <case-file-status-dialog
      v-if="showCaseFileStatusDialog && newStatus"
      data-test="case-file-summary-status-dialog"
      :to-status="newStatus"
      :show.sync="showCaseFileStatusDialog"
      @submit="onSubmitDialog($event)"
      @cancelChange="showCaseFileStatusDialog = false" />

    <rc-confirmation-dialog
      v-if="showConfirmationDialog"
      :loading="loading"
      :show-help="newStatus === CaseFileStatus.Archived "
      :help-link="helpLink"
      data-test="case-file-status-confirmation-dialog"
      :show.sync="showConfirmationDialog"
      :title="confirmationDialogText.title"
      :messages="confirmationDialogText.message"
      @submit="submitStatusChange()"
      @cancel="showConfirmationDialog = false"
      @close="showConfirmationDialog = false" />
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import {
  RcConfirmationDialog,
} from '@libs/component-lib/components';
import { EEventStatus } from '@libs/entities-lib/registration-event';
import { ICaseFileCombined, CaseFileStatus } from '@libs/entities-lib/case-file';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { IEventCombined } from '@libs/entities-lib/event';
import { IListOption } from '@libs/core-lib/types';
import CaseFileStatusDialog from './CaseFileStatusDialog.vue';

export default Vue.extend({
  name: 'CaseFileStatus',

  components: {
    RcConfirmationDialog,
    CaseFileStatusDialog,
    StatusSelect,
  },

  props: {
    caseFile: {
      type: Object as () => ICaseFileCombined,
      required: true,
    },
    event: {
      type: Object as () => IEventCombined,
      required: true,
    },
  },

  data() {
    return {
      CaseFileStatus,
      newStatus: null,
      rationale: null,
      loading: false,
      reason: null,
      showCaseFileStatusDialog: false,
      showConfirmationDialog: false,
    };
  },

  computed: {

    statuses(): Array<CaseFileStatus> {
      if (this.$hasLevel('level3')) {
        return [CaseFileStatus.Archived, CaseFileStatus.Closed, CaseFileStatus.Inactive, CaseFileStatus.Open];
      }

      return [CaseFileStatus.Archived, CaseFileStatus.Closed, CaseFileStatus.Inactive];
    },

    disableStatus() {
      if (this.event?.entity?.schedule?.status !== +EEventStatus.Open && !this.$hasLevel('level6')) {
        return true;
      }
      if (this.caseFile.entity.caseFileStatus === CaseFileStatus.Archived && !this.$hasLevel('level5')) {
        return true;
      }
      return !this.$hasLevel('level2');
    },

    confirmationDialogText() : {title:string, message:string} {
      switch (this.newStatus) {
        case CaseFileStatus.Inactive:
          return {
            title: this.$t('caseFile.changeStatusConfirmTitle.Inactive') as string,
            message: this.$t('caseFile.changeStatusConfirmBody.Inactive') as string,
          };
        case CaseFileStatus.Open:
          return {
            title: this.$t('caseFile.changeStatusConfirmTitle.Open') as string,
            message: this.$t('caseFile.changeStatusConfirmBody.Open') as string,
          };
        case CaseFileStatus.Closed:
          return {
            title: this.$t('caseFile.changeStatusConfirmTitle.Close') as string,
            message: this.$t('caseFile.changeStatusConfirmBody.Close') as string,
          };
        case CaseFileStatus.Archived:
          return {
            title: this.$t('caseFile.changeStatusConfirmTitle.Archived') as string,
            message: this.$t('caseFile.changeStatusConfirmBody.Archived') as string,
          };
        default:
          return { title: '', message: '' };
      }
    },

    helpLink() : string {
      if (this.newStatus === CaseFileStatus.Archived) {
        return this.$t('zendesk.help_link.change_caseFile_status_archived') as string;
      }
      return null;
    },
  },
  methods: {
    onStatusChangeInit(status: CaseFileStatus) {
      this.newStatus = status;
      if (this.newStatus === CaseFileStatus.Archived) {
        this.showConfirmationDialog = true;
      } else {
        this.showCaseFileStatusDialog = true;
      }
    },

    onSubmitDialog(payload: { rationale:string, reason:IListOption }) {
      this.showCaseFileStatusDialog = false;
      this.showConfirmationDialog = true;
      this.rationale = payload.rationale;
      this.reason = payload.reason;
    },

    async submitStatusChange() {
      try {
        this.loading = true;
        await this.$storage.caseFile.actions.setCaseFileStatus(this.caseFile.entity.id, this.newStatus, this.rationale, this.reason);
      } finally {
        this.loading = false;
        this.showConfirmationDialog = false;
      }
    },
  },

});

</script>
