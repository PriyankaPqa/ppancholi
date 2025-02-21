<template>
  <rc-status-chip :color="color" :text-color="textColor">
    <slot name="default">
      <v-progress-circular v-if="showLoading" indeterminate :size="14" :width="2" class="mr-2" data-test="loading-circular" />
      <span data-test="chip-text">
        {{ text ? text : $t(textFromEnum) }}
      </span>
      <v-icon v-if="showChevron" right data-test="chevron-icon">
        mdi-chevron-down
      </v-icon>
    </slot>
  </rc-status-chip>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcStatusChip } from '@libs/component-lib/components';
import { EEventCallCentreStatus, EEventStatus } from '@libs/entities-lib/event';
import colors from '@libs/shared-lib/plugins/vuetify/colors';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { ApprovalStatus, PaymentStatus } from '@libs/entities-lib/financial-assistance-payment';
import { AccountStatus } from '@libs/entities-lib/user-account';
import { DocumentStatus } from '@libs/entities-lib/case-file-document';
import { MassActionRunStatus } from '@libs/entities-lib/mass-action';
import { Status } from '@libs/shared-lib/types';
import { CompletionStatus as AssessmentResponseCompletionStatus } from '@libs/entities-lib/assessment-template';
import { HouseholdStatus } from '@libs/entities-lib/household';
import { TaskStatus } from '@libs/entities-lib/task';
import { AppointmentStatus } from '@libs/entities-lib/appointment';

export default Vue.extend({
  name: 'StatusChip',

  components: {
    RcStatusChip,
  },

  props: {
    statusName: {
      type: String,
      required: true,
      validator: (value: string) => (
        [
          'EEventStatus',
          'Status',
          'EEventCallCentreStatus',
          'EEventLocationStatus',
          'CaseFileStatus',
          'Status',
          'ApprovalStatus',
          'AccountStatus',
          'DocumentStatus',
          'FinancialAssistancePaymentStatus',
          'Status',
          'MassActionRunStatus',
          'AssessmentResponseCompletionStatus',
          'HouseholdStatus',
          'TaskStatus',
          'AppointmentProgramStatus',
          'AppointmentStatus',
        ].indexOf(value) > -1
      ),
    },

    status: {
      type: Number,
      default: null,
    },

    text: {
      type: String,
      default: '',
    },

    showChevron: {
      type: Boolean,
      default: false,
    },

    showLoading: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    color(): string {
      switch (this.statusName) {
        case 'EEventStatus':
          return this.getEventStatusColor();
        case 'EEventCallCentreStatus':
        case 'EEventLocationStatus':
          return this.getEventCallCentreColor();
        case 'CaseFileStatus':
          return this.getCaseFileStatusColor();
        case 'ApprovalStatus':
          return this.getApprovalStatusColor();
        case 'FinancialAssistancePaymentStatus':
          return this.getCaseFileFinancialAssistanceStatusColor();
        case 'AccountStatus':
          return this.getAccountStatusColor();
        case 'DocumentStatus':
          return this.getDocumentStatusColor();
        case 'Status':
        case 'AppointmentProgramStatus':
          return this.getStatusColor();
        case 'MassActionRunStatus':
          return this.getMassActionRunStatusColor();
        case 'AssessmentResponseCompletionStatus':
          return this.getAssessmentResponseCompletionStatusColor();
        case 'HouseholdStatus':
          return this.getHouseholdStatusColor();
        case 'TaskStatus':
          return this.getTaskStatusColor();
        case 'AppointmentStatus':
          return this.getAppointmentStatusColor();
        default:
          return colors.chips.green;
      }
    },

    textColor(): string {
      switch (this.color) {
        case colors.chips.orange:
        case colors.chips.light_grey:
        case colors.chips.green_pale:
        case colors.chips.blue_pale:
        case colors.chips.red_pale:
          return colors.grey.darken4;
        default:
          return colors.white;
      }
    },
    // Once all status are translated in the BE we won't need anymore textFromEnum
    textFromEnum(): string {
      switch (this.statusName) {
        case 'EEventStatus':
          return `eventsTable.eventStatus.${EEventStatus[this.status]}`;
        case 'EEventCallCentreStatus':
        case 'EEventLocationStatus':
          return `eventSummary.status.${EEventCallCentreStatus[this.status]}`;
        case 'CaseFileStatus':
          return `caseFile.status.${CaseFileStatus[this.status]}`;
        case 'ApprovalStatus':
          return `enums.ApprovalStatus.${ApprovalStatus[this.status]}`;
        case 'FinancialAssistancePaymentStatus':
          return `caseFile.financialAssistance.paymentStatus.${PaymentStatus[this.status]}`;
        case 'AccountStatus':
          return `common.account_status.${AccountStatus[this.status]}`;
        case 'DocumentStatus':
          return `caseFile.document.status.${DocumentStatus[this.status]}`;
        case 'Status':
        case 'AppointmentProgramStatus':
          return `enums.Status.${Status[this.status]}`;
        case 'AppointmentStatus':
          return `enums.AppointmentStatus.${AppointmentStatus[this.status]}`;
        case 'MassActionRunStatus':
          return `enums.MassActionRunStatus.${MassActionRunStatus[this.status]}`;
        case 'AssessmentResponseCompletionStatus':
          return `enums.completionStatus.${AssessmentResponseCompletionStatus[this.status]}`;
        case 'HouseholdStatus':
          return `household.profile.householdStatus.${HouseholdStatus[this.status]}`;
        case 'TaskStatus':
          return `task.task_status.${TaskStatus[this.status]}`;

        default:
          return '';
      }
    },
  },

  methods: {
    getEventStatusColor(): string {
      switch (this.status) {
        case EEventStatus.Open:
          return colors.chips.green;

        case EEventStatus.OnHold:
          return colors.chips.green_pale;

        case EEventStatus.Archived:
          return colors.chips.light_grey;

        case EEventStatus.Closed:
          return colors.chips.red;

        default:
          return colors.chips.green;
      }
    },

    getEventCallCentreColor(): string {
      switch (this.status) {
        case EEventCallCentreStatus.Active:
          return colors.chips.green;

        case EEventCallCentreStatus.Inactive:
          return colors.chips.light_grey;

        default:
          return colors.chips.green;
      }
    },

    getCaseFileStatusColor(): string {
      switch (this.status) {
        case CaseFileStatus.Open:
          return colors.chips.green;

        case CaseFileStatus.Inactive:
          return colors.chips.light_grey;

        case CaseFileStatus.Closed:
          return colors.chips.red;

        case CaseFileStatus.Archived:
          return colors.chips.grey;

        default:
          return colors.chips.green;
      }
    },

    getApprovalStatusColor(): string {
      switch (this.status) {
        case ApprovalStatus.New:
          return colors.chips.green_pale;
        case ApprovalStatus.Pending:
          return colors.chips.orange;
        case ApprovalStatus.Declined:
          return colors.chips.red;
        default:
          return colors.chips.green;
      }
    },

    getCaseFileFinancialAssistanceStatusColor(): string {
      switch (this.status) {
        case PaymentStatus.New:
          return colors.chips.green_pale;
        case PaymentStatus.InProgress:
          return colors.chips.orange;
        case PaymentStatus.Sent:
        case PaymentStatus.Issued:
          return colors.chips.blue_pale;
        case PaymentStatus.Cancelled:
          return colors.chips.red;
        default:
          return colors.chips.green;
      }
    },

    getAccountStatusColor(): string {
      switch (this.status) {
        case AccountStatus.Active:
          return colors.chips.green;

        case AccountStatus.Inactive:
          return colors.chips.light_grey;

        case AccountStatus.Pending:
          return colors.chips.green_pale;

        default:
          return colors.chips.green;
      }
    },

    getDocumentStatusColor(): string {
      switch (this.status) {
        case DocumentStatus.Current:
          return colors.chips.green;

        case DocumentStatus.Past:
          return colors.chips.light_grey;

        default:
          return colors.chips.green;
      }
    },

    getStatusColor(): string {
      switch (this.status) {
        case Status.Active:
          return colors.chips.green;

        case Status.Inactive:
          return colors.chips.light_grey;

        default:
          return colors.chips.green;
      }
    },

    getMassActionRunStatusColor(): string {
      switch (this.status) {
        case MassActionRunStatus.Processed:
          return colors.chips.green;

        case MassActionRunStatus.PreProcessing:
          return colors.chips.orange;

        case MassActionRunStatus.Processing:
          return colors.chips.orange;

        case MassActionRunStatus.PreProcessed:
          return colors.chips.green_pale;

        case MassActionRunStatus.FailedProcessing:
          return colors.chips.red;

        case MassActionRunStatus.FailedPreProcessing:
          return colors.chips.red;

        default:
          return colors.chips.green;
      }
    },

    getAssessmentResponseCompletionStatusColor(): string {
      switch (this.status) {
        case AssessmentResponseCompletionStatus.Pending:
          return colors.chips.orange;

        case AssessmentResponseCompletionStatus.Partial:
          return colors.chips.green_pale;

        case AssessmentResponseCompletionStatus.Completed:
          return colors.chips.green;

        case AssessmentResponseCompletionStatus.Obsolete:
          return colors.chips.light_grey;

        default:
          return colors.chips.green;
      }
    },

    getHouseholdStatusColor(): string {
      switch (this.status) {
        case HouseholdStatus.Open:
          return colors.chips.green;

        case HouseholdStatus.Archived:
          return colors.chips.grey;

        case HouseholdStatus.Closed:
          return colors.chips.red;

        default:
          return colors.chips.green;
      }
    },

    getTaskStatusColor(): string {
      switch (this.status) {
        case TaskStatus.New:
          return colors.chips.green_pale;

        case TaskStatus.InProgress:
          return colors.chips.orange;

        case TaskStatus.Completed:
          return colors.chips.green;

        case TaskStatus.Cancelled:
          return colors.chips.red;

        default:
          return colors.chips.orange;
      }
    },

    getAppointmentStatusColor(): string {
      switch (this.status) {
        case AppointmentStatus.Scheduled:
          return colors.chips.green;

        case AppointmentStatus.Rescheduled:
          return colors.chips.green_pale;

        case AppointmentStatus.Cancelled:
          return colors.chips.red;

        default:
          return colors.chips.grey;
      }
    },
  },
});
</script>
