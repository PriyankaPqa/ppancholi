<template>
  <v-container fluid class="py-4 px-6">
    <v-row>
      <v-col v-for="(card, $index) in availableCards" :key="$index" xs="12" sm="12" md="3" lg="3">
        <rc-menu-card
          class="cards"
          :title="$t(card.title)"
          :text="$t(card.description)"
          :button-text="$t(card.button)"
          :data-test="card.dataTest"
          :route-name="card.route"
          :secondary-button-text="$t(card.secondaryButton)"
          :show-secondary-button="card.showSecondaryButton"
          @click="onClick(card.onClick)"
          @click-secondary="onClick(card.onSecondaryClick)" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { RcMenuCard } from '@crctech/component-library';
import mixins from 'vue-typed-mixins';
import routes from '@/constants/routes';
import massActions, { IMassActionCards } from '@/ui/mixins/massActions';

export default mixins(massActions).extend({
  name: 'MassActionsHome',

  components: {
    RcMenuCard,
  },

  computed: {
    routes() {
      return routes;
    },

    cards(): Array<IMassActionCards> {
      return [
        {
          title: 'mass_action.card.financial_assistance',
          description: 'mass_action.card.group1',
          button: 'mass_action.card.action.view',
          route: routes.massActions.financialAssistance.home.name,
          dataTest: 'massAction_financial',
          level: 'level6',
          roles: null,
          group: 1,
        },
        {
          title: 'mass_action.card.export_validation_impact',
          description: 'mass_action.card.group4',
          button: 'mass_action.card.action.export',
          route: null,
          dataTest: 'massAction_export_validation_impact',
          level: 'level6',
          roles: ['contributorIM'],
          group: 4,
          onClick: 'exportImpactValidation',
        },
        {
          title: 'mass_action.card.import_validation_impact',
          description: 'mass_action.card.group4',
          button: 'mass_action.card.action.view',
          route: null,
          dataTest: 'massAction_import_validation_impact',
          level: 'level6',
          roles: ['contributorIM'],
          group: 4,
          onClick: 'importValidationImpact',
        },
        {
          title: 'mass_action.card.generate_funding',
          description: 'mass_action.card.group4',
          button: 'mass_action.card.action.generate',
          route: null,
          dataTest: 'massAction_generate_funding',
          level: 'level6',
          roles: ['contributorFinance'],
          group: 4,
          onClick: 'generateFundingRequest',
        },
        {
          title: 'mass_action.card.import_payment_statuses',
          description: 'mass_action.card.group4',
          button: 'mass_action.card.action.import',
          secondaryButton: 'mass_action.card.action.download_template',
          showSecondaryButton: true,
          route: null,
          dataTest: 'massAction_import_payment_statuses',
          level: 'level6',
          roles: ['contributorFinance'],
          group: 4,
          onClick: 'importPaymentStatuses',
          onSecondaryClick: 'downloadTemplate',
        },
      ];
    },

    availableCards(): Array<IMassActionCards> {
      return this.filterItemsOnLevelOrRole(this.cards);
    },
  },
});
</script>

<style scoped lang="scss">
.cards {
  min-height: 200px;
};

@media only screen and (min-width: $breakpoint-sm-min) and (max-width: $breakpoint-lg-min) {
  .cards {
    min-height: 300px;
  };
}

</style>
