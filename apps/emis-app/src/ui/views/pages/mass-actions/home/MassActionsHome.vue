<template>
  <v-container fluid>
    <v-row>
      <v-col v-for="(card, $index) in availableCards" :key="$index" xs="12" sm="12" md="4" lg="3">
        <rc-menu-card
          class="cards"
          :title="$t(card.title)"
          :text="$t(card.description)"
          :button-text="$t(card.button)"
          :data-test="card.dataTest"
          :route-name="card.route"
          :secondary-button-text="$t(card.secondaryButton)"
          :show-secondary-button="card.showSecondaryButton"
          :secondary-menu="card.secondaryButtonIsMenu"
          :secondary-menu-items="card.secondaryMenuItems"
          @click="onClick(card.onClick)"
          @click-secondary="onClick(card.onSecondaryClick)"
          @click-secondary-menu="onClickMenu(card.onClickMenu, $event)" />
      </v-col>
    </v-row>
    <impact-status-case-file-filtering v-if="showExportValidationImpact" :show.sync="showExportValidationImpact" />
  </v-container>
</template>

<script lang="ts">
import { RcMenuCard } from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import routes from '@/constants/routes';
import massActions, { IMassActionCards } from '@/ui/views/pages/mass-actions/mixins/massActions';
import ImpactStatusCaseFileFiltering from '@/ui/views/pages/mass-actions/export-validation-status/ImpactStatusCaseFileFiltering.vue';
import helpers from '@/ui/helpers/helpers';
import { MassActionDataCorrectionType, MassActionGroup } from '@libs/entities-lib/mass-action';
import { UserRoles } from '@libs/entities-lib/user';

export default mixins(massActions).extend({
  name: 'MassActionsHome',

  components: {
    ImpactStatusCaseFileFiltering,
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
          description: this.$t('mass_action.card.group', { x: 1 }),
          button: 'mass_action.card.action.view',
          route: routes.massActions.financialAssistance.home.name,
          dataTest: 'massAction_financial',
          level: UserRoles.level6,
          roles: null,
          group: MassActionGroup.Group1,
        },
        {
          title: 'mass_action.card.assessments',
          description: this.$t('mass_action.card.group', { x: 1 }),
          button: 'mass_action.card.action.view',
          route: routes.massActions.assessments.home.name,
          dataTest: 'massAction_assessments',
          level: UserRoles.level6,
          roles: null,
          group: MassActionGroup.Group1,
        },
        {
          title: 'mass_action.card.communications',
          description: this.$t('mass_action.card.group', { x: 1 }),
          button: 'mass_action.card.action.view',
          route: routes.massActions.communications.home.name,
          dataTest: 'massAction_communications',
          level: UserRoles.level6,
          roles: null,
          group: MassActionGroup.Group1,
        },
        {
          title: 'mass_action.card.caseFileStatus',
          description: this.$t('mass_action.card.group', { x: 1 }),
          button: 'mass_action.card.action.view',
          route: routes.massActions.caseFileStatus.home.name,
          dataTest: 'massAction_case_file_status',
          level: UserRoles.level5,
          roles: null,
          group: MassActionGroup.Group1,
        },
        {
          title: 'mass_action.card.finance_customoptions',
          description: this.$t('mass_action.card.group', { x: 3 }),
          button: 'mass_action.card.action.view',
          secondaryButton: 'mass_action.card.action.download_template',
          showSecondaryButton: true,
          route: routes.massActions.financialAssistanceCustom.home.name,
          dataTest: 'massAction_finance_customoptions',
          level: UserRoles.level6,
          roles: null,
          group: MassActionGroup.Group3,
          onSecondaryClick: 'downloadFACustomTemplate',
        },
        {
          title: 'mass_action.card.export_validation_impact',
          description: this.$t('mass_action.card.group', { x: 4 }),
          button: 'mass_action.card.action.export',
          route: null,
          dataTest: 'massAction_export_validation_impact',
          level: UserRoles.level6,
          roles: [UserRoles.contributorIM],
          group: MassActionGroup.Group4,
          onClick: 'exportImpactValidation',
        },
        {
          title: 'mass_action.card.import_validation_impact',
          description: this.$t('mass_action.card.group', { x: 4 }),
          button: 'mass_action.card.action.view',
          route: routes.massActions.importValidationStatus.home.name,
          dataTest: 'massAction_import_validation_impact',
          level: UserRoles.level6,
          roles: [UserRoles.contributorIM],
          group: MassActionGroup.Group4,
        },
        {
          title: 'mass_action.card.generate_funding',
          description: this.$t('mass_action.card.group', { x: 4 }),
          button: 'mass_action.card.action.view',
          route: routes.massActions.fundingRequest.home.name,
          dataTest: 'massAction_generate_funding',
          level: UserRoles.level6,
          roles: [UserRoles.contributorFinance],
          group: MassActionGroup.Group4,
          onClick: 'generateFundingRequest',
        },
        {
          title: 'mass_action.card.import_payment_statuses',
          description: this.$t('mass_action.card.group', { x: 4 }),
          button: 'mass_action.card.action.view',
          secondaryButton: 'mass_action.card.action.download_template',
          showSecondaryButton: true,
          route: routes.massActions.importPaymentStatus.home.name,
          dataTest: 'massAction_import_payment_statuses',
          level: UserRoles.level6,
          roles: [UserRoles.contributorFinance],
          group: MassActionGroup.Group4,
          onSecondaryClick: 'downloadImportPaymentStatusesTemplate',
        },
        {
          title: 'mass_action.card.import_users',
          description: this.$t('mass_action.card.group', { x: 4 }),
          button: 'mass_action.card.action.view',
          secondaryButton: 'mass_action.card.action.download_template',
          showSecondaryButton: true,
          route: routes.massActions.importUsers.home.name,
          dataTest: 'massAction_import_users',
          level: UserRoles.level6,
          roles: null,
          group: MassActionGroup.Group4,
          onSecondaryClick: 'downloadImportUsersTemplate',
        },
        {
          title: 'mass_action.card.data_correction',
          description: this.$t('mass_action.card.group', { x: 5 }),
          button: 'mass_action.card.action.view',
          route: routes.massActions.dataCorrection.home.name,
          dataTest: 'massAction_data_correction',
          level: UserRoles.level6,
          roles: null,
          group: MassActionGroup.Group5,
          secondaryButton: 'mass_action.card.action.download_template',
          showSecondaryButton: true,
          secondaryButtonIsMenu: true,
          secondaryMenuItems: this.massActionTypes,
          onClickMenu: 'downloadDataCorrectionTemplate',
        },
      ];
    },

    availableCards(): Array<IMassActionCards> {
      return this.filterItems(this.cards);
    },

    massActionTypes(): Array<Record<string, unknown>> {
      return helpers.enumToTranslatedCollection(MassActionDataCorrectionType, 'enums.MassActionDataCorrectionType', false)
        .filter((m) => (m.value !== MassActionDataCorrectionType.DataCorrectionAuthenticationSpecifiedOther
        && (this.$hasFeature(this.$featureKeys.MovePayments) || m.value !== MassActionDataCorrectionType.DataCorrectionMovePayments)));
    },
  },
});
</script>

<style scoped lang="scss">

</style>
