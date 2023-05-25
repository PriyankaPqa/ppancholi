<template>
  <mass-action-base-table
    :mass-action-type="massActionType"
    :details-route-name="detailsRouteName"
    :add-route-name="addRouteName"
    :table-title="tableTitle"
    :search-endpoint="searchEndpoint"
    :show-add-button="$hasLevel(UserRoles.level6)"
    :add-button-label="addButtonLabel"
    :additional-columns="additionalColumns" />
</template>

<script lang="ts">

import mixins from 'vue-typed-mixins';
import massActionsTable from '@/ui/views/pages/mass-actions/mixins/massActionsTable';
import routes from '@/constants/routes';
import { IMassActionCombined, MassActionType } from '@libs/entities-lib/mass-action';
import MassActionBaseTable from '@/ui/views/pages/mass-actions/components/MassActionBaseTable.vue';
import { UserRoles } from '@libs/entities-lib/user';
import { DataTableHeader } from 'vuetify';

export default mixins(massActionsTable).extend({
  name: 'FinancialAssistanceCustomHome',

  components: {
    MassActionBaseTable,
  },

  data: () => ({
    massActionType: MassActionType.FinancialAssistanceCustomOptions,
    detailsRouteName: routes.massActions.financialAssistanceCustom.details.name,
    tableTitle: 'massAction.financialAssistanceCustomTable.title',
    addButtonLabel: 'massActions.financialAssistance.tooltip.add',
    searchEndpoint: 'financial-assistance-custom',
    addRouteName: routes.massActions.financialAssistanceCustom.create.name,
    UserRoles,
  }),

  computed: {
    additionalColumns() : { name: string, header: DataTableHeader, index: number, templateFct: (item: any) => string }[] {
      return [
        { name: 'totalAmount',
          index: 4,
          header: {
            text: this.$t('massAction.common.total') as string,
            value: 'Metadata/LastRun/TotalAmount',
            sortable: true,
          },
          templateFct: (item: IMassActionCombined) => (this.getLastRunMetadata(item)?.totalAmount != null
            ? this.$formatCurrency(this.getLastRunMetadata(item) && this.getLastRunMetadata(item).totalAmount)
            : this.$t('common.toBeDetermined') as string),
        },
      ];
    },
  },
});
</script>
