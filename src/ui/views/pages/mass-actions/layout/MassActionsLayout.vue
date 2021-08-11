<template>
  <page-template
    :navigation-tabs="availableTabs"
    :show-left-menu="showLeftMenu"
    :loading="false"
    :group-mode="true"
    :left-menu-title="$t('system_management.leftMenu.title')"
    hide-dividers
    @click:tab="onClick($event)">
    <rc-router-view-transition />
  </page-template>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';
import { RcRouterViewTransition } from '@crctech/component-library';
import mixins from 'vue-typed-mixins';
import metadata from '@/ui/mixins/metadata';
import routes from '@/constants/routes';
import { PageTemplate } from '@/ui/views/components/layout';
import massActions from '@/ui/mixins/massActions';
import { INavigationTabGroup } from '@/types/interfaces/ui/INavigationTab';

export default mixins(massActions).extend({
  name: 'MassActionsLayout',
  components: {
    RcRouterViewTransition,
    PageTemplate,
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
          name: this.$t('mass_action.card.group1'),
          items: [
            {
              text: this.$t('mass_action.card.financial_assistance'),
              test: 'mass_action.card.financial_assistance',
              to: routes.massActions.financialAssistance.name,
              exact: false,
              level: 'level6',
            },
          ],
        },
        {
          name: this.$t('mass_action.card.group4'),
          items: [
            {
              text: this.$t('mass_action.card.export_validation_impact'),
              test: 'mass_action.card.export_validation_impact',
              to: null,
              exact: false,
              level: 'level6',
              roles: ['contributorIM'],
              onClick: 'exportImpactValidation',
            },
            {
              text: this.$t('mass_action.card.import_validation_impact'),
              test: 'mass_action.card.import_validation_impact',
              to: routes.massActions.importValidationStatus.home.name,
              exact: false,
              level: 'level6',
              roles: ['contributorIM'],
            },
            {
              text: this.$t('mass_action.card.generate_funding'),
              test: 'mass_action.card.generate_funding',
              to: null,
              exact: false,
              level: 'level6',
              roles: ['contributorFinance'],
              onClick: 'generateFundingRequest',
            },
            {
              text: this.$t('mass_action.card.import_payment_statuses'),
              test: 'mass_action.card.import_payment_statuses',
              to: null,
              exact: false,
              level: 'level6',
              roles: ['contributorFinance'],
              onClick: 'importPaymentStatuses',
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
        const filterItems = this.filterItemsOnLevelOrRole(group.items);
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
