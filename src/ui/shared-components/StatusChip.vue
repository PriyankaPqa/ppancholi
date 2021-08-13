<template>
  <rc-status-chip :color="color" :text-color="textColor">
    <slot name="default">
      <v-progress-circular v-if="showLoading" indeterminate :size="14" :width="2" class="mr-2" />
      {{ text ? text : $t(textFromEnum) }}
      <v-icon v-if="showChevron" right>
        mdi-chevron-down
      </v-icon>
    </slot>
  </rc-status-chip>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcStatusChip } from '@crctech/component-library';
import { EEventCallCentreStatus, EEventStatus } from '@/entities/event';
import { EOptionListItemStatus } from '@/entities/optionItem';
import colors from '@/ui/plugins/vuetify/colors';
import { CaseFileStatus } from '@/entities/case-file';
import { FPaymentStatus } from '@/entities/case-file-financial-assistance';
import { EProgramStatus } from '@/entities/program';
import { AccountStatus } from '@/entities/user-account';
import { Status } from '@/entities/base';
import { DocumentStatus } from '@/entities/case-file-document';
import { MassActionRunStatus } from '@/entities/mass-action';

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
          'EOptionListItemStatus',
          'EEventCallCentreStatus',
          'EEventLocationStatus',
          'CaseFileStatus',
          'EProgramStatus',
          'AccountStatus',
          'DocumentStatus',
          'CaseFileFinancialAssistanceStatus',
          'Status',
          'MassActionRunStatus',
        ].indexOf(value) > -1
      ),
    },

    status: {
      type: Number,
      required: true,
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
        case 'EOptionListItemStatus':
          return this.getOptionListStatusColor();
        case 'CaseFileStatus':
          return this.getCaseFileStatusColor();
        case 'CaseFileFinancialAssistanceStatus':
          return this.getCaseFileFinancialAssistanceStatusColor();
        case 'EProgramStatus':
          return this.getProgramStatusColor();
        case 'AccountStatus':
          return this.getAccountStatusColor();
        case 'DocumentStatus':
          return this.getDocumentStatusColor();
        case 'Status':
          return this.getStatusColor();
        case 'MassActionRunStatus':
          return this.getMassActionRunStatusColor();

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
        case 'EOptionListItemStatus':
          return `system_management.lists.status.${EOptionListItemStatus[this.status]}`;
        case 'CaseFileStatus':
          return `caseFile.status.${CaseFileStatus[this.status]}`;
        case 'CaseFileFinancialAssistanceStatus':
          return `caseFile.financialAssistance.paymentStatus.${FPaymentStatus[this.status]}`;
        case 'EProgramStatus':
          return `common.program_status.${EProgramStatus[this.status]}`;
        case 'AccountStatus':
          return `common.account_status.${AccountStatus[this.status]}`;
        case 'DocumentStatus':
          return `caseFile.document.status.${DocumentStatus[this.status]}`;
        case 'Status':
          return `enums.Status.${Status[this.status]}`;
        case 'MassActionRunStatus':
          return `enums.MassActionRunStatus.${MassActionRunStatus[this.status]}`;

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

    getOptionListStatusColor(): string {
      switch (this.status) {
        case EOptionListItemStatus.Active:
          return colors.chips.green;

        case EOptionListItemStatus.Inactive:
          return colors.chips.grey;

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

    getCaseFileFinancialAssistanceStatusColor(): string {
      switch (this.status) {
        case FPaymentStatus.New:
          return colors.chips.green_pale;
        default:
          return colors.chips.green_pale;
      }
    },

    getProgramStatusColor(): string {
      switch (this.status) {
        case EProgramStatus.Active:
          return colors.chips.green;

        case EProgramStatus.Inactive:
          return colors.chips.light_grey;

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

        default:
          return colors.chips.green;
      }
    },
  },
});
</script>
