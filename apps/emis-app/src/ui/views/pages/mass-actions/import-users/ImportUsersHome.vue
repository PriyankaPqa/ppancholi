<template>
  <mass-action-base-table
    :mass-action-type="massActionType"
    :details-route-name="detailsRouteName"
    :add-route-name="addRouteName"
    :table-title="tableTitle"
    :search-endpoint="searchEndpoint"
    :show-add-button="$hasLevel('level6')"
    :add-button-label="addButtonLabel" />
</template>

<script lang="ts">

import Vue from 'vue';
import routes from '@/constants/routes';
import { MassActionType } from '@/entities/mass-action';
import MassActionBaseTable from '@/ui/views/pages/mass-actions/components/MassActionBaseTable.vue';

export default Vue.extend({
  name: 'ImportUsersHome',

  components: {
    MassActionBaseTable,
  },

  data: () => ({
    massActionType: MassActionType.ImportUsers,
    detailsRouteName: routes.massActions.importUsers.details.name,
    tableTitle: 'massAction.importUsersTable.title',
    addButtonLabel: 'massActions.importUsers.tooltip.add',
    searchEndpoint: 'import-users-mass-actions',
    addRouteName: routes.massActions.importUsers.create.name,
  }),
});
</script>
