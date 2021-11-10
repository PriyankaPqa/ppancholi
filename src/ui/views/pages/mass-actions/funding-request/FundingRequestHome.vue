<template>
  <mass-action-base-table
    :mass-action-type="massActionType"
    :details-route-name="detailsRouteName"
    :add-route-name="addRouteName"
    :table-title="tableTitle"
    :search-endpoint="searchEndpoint"
    :add-button-label="addButtonLabel"
    :show-add-button="$hasLevel('level6') || $hasRole('contributorFinance')" />
</template>

<script lang="ts">

import Vue from 'vue';
import routes from '@/constants/routes';
import { MassActionType } from '@/entities/mass-action';
import MassActionBaseTable from '@/ui/views/pages/mass-actions/components/MassActionBaseTable.vue';

export default Vue.extend({
  name: 'FundingRequestHome',

  components: {
    MassActionBaseTable,
  },

  data: () => ({
    massActionType: MassActionType.GenerateFundingRequest,
    detailsRouteName: routes.massActions.fundingRequest.details.name,
    tableTitle: 'massAction.fundingRequestTable.title',
    searchEndpoint: 'generate-funding-mass-actions',
    addRouteName: routes.massActions.fundingRequest.create.name,
    addButtonLabel: 'massActions.fundingRequest.tooltip.add',
  }),
});
</script>
