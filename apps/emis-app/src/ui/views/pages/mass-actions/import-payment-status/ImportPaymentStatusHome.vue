<template>
  <mass-action-base-table
    :mass-action-type="massActionType"
    :details-route-name="detailsRouteName"
    :add-route-name="addRouteName"
    :table-title="tableTitle"
    :search-endpoint="searchEndpoint"
    :show-add-button="$hasLevel(UserRoles.level6) || $hasRole(UserRoles.contributorFinance)"
    :add-button-label="addButtonLabel" />
</template>

<script lang="ts">

import Vue from 'vue';
import routes from '@/constants/routes';
import { MassActionType } from '@libs/entities-lib/mass-action';
import MassActionBaseTable from '@/ui/views/pages/mass-actions/components/MassActionBaseTable.vue';
import { UserRoles } from '@libs/entities-lib/user';

export default Vue.extend({
  name: 'ImportPaymentStatusHome',

  components: {
    MassActionBaseTable,
  },

  data: () => ({
    massActionType: MassActionType.ImportPaymentStatuses,
    detailsRouteName: routes.massActions.importPaymentStatus.details.name,
    tableTitle: 'massAction.importPaymentStatusTable.title',
    addButtonLabel: 'massActions.importPaymentStatus.tooltip.add',
    searchEndpoint: 'import-payment-status-mass-actions',
    addRouteName: routes.massActions.importPaymentStatus.create.name,
    UserRoles,
  }),
});
</script>
