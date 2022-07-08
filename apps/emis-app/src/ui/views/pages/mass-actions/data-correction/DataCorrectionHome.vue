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
import MassActionBaseTable from '@/ui/views/pages/mass-actions/components/MassActionBaseTable.vue';
import { MassActionDataCorrectionType } from '@/entities/mass-action';
import helpers from '@/ui/helpers/helpers';

export default Vue.extend({
  name: 'DataCorrectionHome',

  components: {
    MassActionBaseTable,
  },

  data: () => ({
    MassActionDataCorrectionType,
    massActionType: helpers.getEnumValues(MassActionDataCorrectionType) as Array<MassActionDataCorrectionType>,
    detailsRouteName: routes.massActions.dataCorrection.details.name,
    tableTitle: 'massAction.dataCorrectionTable.title',
    addButtonLabel: 'massActions.dataCorrection.tooltip.add',
    searchEndpoint: 'data-correction-mass-actions',
    addRouteName: routes.massActions.dataCorrection.create.name,
  }),
});
</script>
