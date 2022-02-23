<template>
  <mass-action-base-table
    :mass-action-type="massActionType"
    :details-route-name="detailsRouteName"
    :add-route-name="addRouteName"
    :table-title="tableTitle"
    :search-endpoint="searchEndpoint"
    :show-add-button="$hasLevel('level6') || $hasRole('contributorIM')"
    :add-button-label="addButtonLabel" />
</template>

<script lang="ts">

import Vue from 'vue';
import routes from '@/constants/routes';
import { MassActionType } from '@/entities/mass-action';
import MassActionBaseTable from '@/ui/views/pages/mass-actions/components/MassActionBaseTable.vue';

export default Vue.extend({
  name: 'ImportValidationStatusHome',

  components: {
    MassActionBaseTable,
  },

  data: () => ({
    massActionType: MassActionType.ImportValidationOfImpactStatus,
    detailsRouteName: routes.massActions.importValidationStatus.details.name,
    tableTitle: 'massAction.impactValidationStatusTable.title',
    addButtonLabel: 'massActions.importValidationStatus.tooltip.add',
    searchEndpoint: 'validate-impact-status-mass-actions',
    addRouteName: routes.massActions.importValidationStatus.create.name,
  }),
});
</script>
