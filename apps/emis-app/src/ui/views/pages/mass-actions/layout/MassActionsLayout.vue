<template>
  <page-template
    :navigation-tabs="availableTabs"
    :show-left-menu="showLeftMenu"
    :loading="false"
    :group-mode="true"
    :left-menu-title="$t('leftMenu.mass_actions_title')"
    hide-dividers
    @click:tab="onClick($event)">
    <rc-router-view-transition />
    <impact-status-case-file-filtering v-if="showExportValidationImpact" :show.sync="showExportValidationImpact" />
  </page-template>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import { RcRouterViewTransition } from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import metadata from '@/ui/mixins/metadata';
import routes from '@/constants/routes';
import { PageTemplate } from '@/ui/views/components/layout';
import massActions from '@/ui/views/pages/mass-actions/mixins/massActions';
import ImpactStatusCaseFileFiltering from '@/ui/views/pages/mass-actions/export-validation-status/ImpactStatusCaseFileFiltering.vue';
import { INavigationTabGroup } from '@libs/shared-lib/types';
import { UserRoles } from '@libs/entities-lib/user';

export default mixins(massActions).extend({
  name: 'MassActionsLayout',
  components: {
    RcRouterViewTransition,
    PageTemplate,
    ImpactStatusCaseFileFiltering,
  },

  mixins: [metadata],

  computed: {
    metaTitle(): TranslateResult {
      return this.$t('metaInfo.mass_actions.title');
    },

    metaDescription(): TranslateResult {
      return this.$t('metaInfo.mass_actions.description');
    },

    tabs(): Array<INavigationTabGroup> {
      return [
        {
          name: this.$t('mass_action.card.group', { x: 1 }),
          items: [
            {
              text: this.$t('mass_action.card.financial_assistance'),
              test: 'mass_action.card.financial_assistance',
              to: routes.massActions.financialAssistance.home.name,
              exact: false,
              level: UserRoles.level6,
            },
            {
              text: this.$t('mass_action.card.assessments'),
              test: 'mass_action.card.assessments',
              to: routes.massActions.assessments.home.name,
              exact: false,
              level: UserRoles.level6,
            },
            {
              text: this.$t('mass_action.card.communications'),
              test: 'mass_action.card.communications',
              to: routes.massActions.communications.home.name,
              exact: false,
              level: UserRoles.level6,
            },
            {
              text: this.$t('mass_action.card.authentication_retry'),
              test: 'mass_action.card.authentication_retry',
              to: routes.massActions.authenticationRetry.home.name,
              exact: false,
              level: UserRoles.level6,
              feature: this.$featureKeys.AuthenticationRetry,
            },
            {
              text: this.$t('mass_action.card.caseFileStatus'),
              test: 'mass_action.card.case_file_status',
              to: routes.massActions.caseFileStatus.home.name,
              exact: false,
              level: UserRoles.level5,
            },
          ],
        },
        {
          name: this.$t('mass_action.card.group', { x: 3 }),
          items: [
            {
              text: this.$t('mass_action.card.finance_customoptions'),
              test: 'mass_action.card.finance_customoptions',
              to: routes.massActions.financialAssistanceCustom.home.name,
              exact: false,
              level: UserRoles.level6,
            },
          ],
        },
        {
          name: this.$t('mass_action.card.group', { x: 4 }),
          items: [
            {
              text: this.$t('mass_action.card.export_validation_impact'),
              test: 'mass_action.card.export_validation_impact',
              to: null,
              exact: false,
              level: UserRoles.level6,
              roles: [UserRoles.contributorIM],
              onClick: 'exportImpactValidation',
            },
            {
              text: this.$t('mass_action.card.import_validation_impact'),
              test: 'mass_action.card.import_validation_impact',
              to: routes.massActions.importValidationStatus.home.name,
              exact: false,
              level: UserRoles.level6,
              roles: [UserRoles.contributorIM],
            },
            {
              text: this.$t('mass_action.card.generate_funding'),
              test: 'mass_action.card.generate_funding',
              to: routes.massActions.fundingRequest.home.name,
              exact: false,
              level: UserRoles.level6,
              roles: [UserRoles.contributorFinance],
              onClick: 'generateFundingRequest',
            },
            {
              text: this.$t('mass_action.card.import_payment_statuses'),
              test: 'mass_action.card.import_payment_statuses',
              to: routes.massActions.importPaymentStatus.home.name,
              exact: false,
              level: UserRoles.level6,
              roles: [UserRoles.contributorFinance],
            },
            {
              text: this.$t('mass_action.card.import_users'),
              test: 'mass_action.card.import_users',
              to: routes.massActions.importUsers.home.name,
              exact: false,
              level: UserRoles.level6,
            },
            {
              text: this.$t('massAction.addRemoveTeamMembersTable.title'),
              test: 'mass_action.card.add_remove_team_members',
              to: routes.massActions.addRemoveTeamMembers.home.name,
              exact: false,
              level: UserRoles.level5,
              feature: this.$featureKeys.AddRemoveTeamMembers,
            },
          ],
        },
        {
          name: this.$t('mass_action.card.group', { x: 5 }),
          items: [
            {
              text: this.$t('mass_action.card.data_correction'),
              test: 'mass_action.card.data_correction',
              to: routes.massActions.dataCorrection.home.name,
              exact: false,
              level: UserRoles.level6,
            },
          ],
        },
      ];
    },

    showLeftMenu(): boolean {
      return (this.$route.name !== routes.massActions.home.name);
    },

    availableTabs(): Array<INavigationTabGroup> {
      return this.tabs.reduce((result, group) => {
        const filterItems = this.filterItems(group.items);
        if (filterItems.length > 0) {
          result.push({
            name: group.name,
            items: filterItems,
          });
        }
        return result;
      }, []);
    },
  },
});
</script>
