<template>
  <div>
    <v-row no-gutters class="row-data">
      <v-col cols="12" md="5">
        <span class="rc-body14 fw-bold">{{ $t('massActions.type') }}</span>
      </v-col>
      <v-col md="7">
        <span class="rc-body14" data-test="massActionTypeText">{{ $t(massActionTypeText) }}</span>
      </v-col>
    </v-row>

    <v-row no-gutters class="row-data">
      <v-col cols="12" md="5">
        <span class="rc-body14 fw-bold">{{ $t('massActions.date_created') }}</span>
      </v-col>
      <v-col md="7">
        <span class="rc-body14" data-test="dateCreated">{{ moment(massAction.created).local().format('ll') }}</span>
      </v-col>
    </v-row>

    <v-row no-gutters class="row-data">
      <v-col cols="12" md="5">
        <span class="rc-body14 fw-bold">{{ $t('massActions.created_by') }}</span>
      </v-col>
      <v-col md="7">
        <span v-if="userAccountMetadata" class="rc-body14" data-test="createdBy">{{ userAccountMetadata.displayName }}</span>
        <v-progress-circular v-else indeterminate color="primary" />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from 'moment';
import {
  IMassActionEntity, MassActionDataCorrectionType, MassActionRunStatus, MassActionType,
} from '@libs/entities-lib/mass-action';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';

export default Vue.extend({
  name: 'MassActionDetailsTable',

  props: {
    massAction: {
      type: Object as () => IMassActionEntity,
      required: true,
    },
  },

  data() {
    return {
      moment,
      MassActionRunStatus,
      loading: false,
      labels: {
        [MassActionType.FinancialAssistance]: 'massActions.type.financialAssistance',
        [MassActionType.ImportValidationOfImpactStatus]: 'massActions.type.importValidationImpactStatus',
        [MassActionType.ImportPaymentStatuses]: 'massActions.type.importPaymentStatus',
        [MassActionType.ImportUsers]: 'massActions.type.importUsers',
        [MassActionType.GenerateFundingRequest]: 'massActions.type.fundingRequest',
        [MassActionType.Assessments]: 'massActions.type.assessment',
        [MassActionType.FinancialAssistanceCustomOptions]: 'massAction.financialAssistanceCustomTable.title',
      } as Record<MassActionType, string>,
    };
  },

  computed: {
    massActionTypeText(): string {
      if (Object.keys(this.labels).includes(this.massAction.type.toString())) {
        return this.labels[this.massAction.type as MassActionType];
      }
      return `enums.MassActionDataCorrectionType.${MassActionDataCorrectionType[this.massAction.type]}`;
    },

    userAccountMetadata(): IUserAccountMetadata {
      return useUserAccountMetadataStore().getById(this.massAction.createdBy);
    },
  },

  async mounted() {
    this.loading = true;
    await useUserAccountMetadataStore().fetch(this.massAction.createdBy, false);
    this.loading = false;
  },
});
</script>

<style lang="scss" scoped>
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
