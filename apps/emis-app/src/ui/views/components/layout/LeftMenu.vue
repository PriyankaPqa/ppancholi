<template>
  <v-navigation-drawer
    id="left-menu-dashboard"
    v-click-outside="{ handler: onClickOutside, include: hamburgerMenu }"
    :value="show"
    :mini-variant="mini"
    :class="{ expanded: !mini }"
    mini-variant-width="80"
    :aria-label="$t('a11y.left_menu')"
    :mobile-breakpoint="$vuetify.breakpoint.thresholds.sm"
    app
    left
    :permanent="!smAndDown"
    clipped
    @input="updateShow">
    <v-list nav>
      <rc-tooltip
        v-for="(item, index) in availableItems"
        :key="index"
        right
        :disabled="!mini">
        <template #activator="{ on } ">
          <v-list-item
            link
            class="navMenu"
            active-class="navMenu__active"
            :disabled="item.disabled"
            :to="{ name: item.to }"
            :exact="typeof item.exact === 'undefined' ? true : item.exact"
            :data-test="item.test"
            v-on="on"
            @click="onClickOutside">
            <v-list-item-icon :class="{ expanded: !mini, shrink: mini, 'menu-icon': true }">
              <v-icon :disabled="item.disabled">
                {{ item.icon }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="menu-title">
                {{ $t(item.text) }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        {{ $t(item.text) }}
      </rc-tooltip>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcTooltip } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import { ui } from '@/constants/ui';
import { INavigationTab } from '@libs/shared-lib/types';
import { UserRoles } from '@libs/entities-lib/user';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

import { ClickOutside } from 'vuetify/es5/directives';
import { useDashboardStore } from '@/pinia/dashboard/dashboard';
import helpers from '@/ui/helpers/helpers';

export default Vue.extend({
  name: 'LeftMenu',

  directives: {
    ClickOutside,
  },

  components: {
    RcTooltip,
  },

  data() {
    return {
      leftMenu: true,
      routes,
    };
  },

  computed: {
    items(): INavigationTab[] {
      const tasksTab = {
        to: routes.tasks.home.name,
        icon: 'mdi-clipboard-check',
        text: 'leftMenu.tasks_title',
        test: 'tasks',
        level: UserRoles.level0,
        roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly, UserRoles.no_role],
      };

      const tabs = [
        {
          to: routes.home.name,
          icon: 'mdi-home',
          text: 'leftMenu.home_title',
          test: 'home',
          level: UserRoles.level0,
          roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly, UserRoles.no_role],
        },
        {
          to: routes.caseFile.home.name,
          icon: 'mdi-clipboard-text',
          text: 'leftMenu.caseFiles_title',
          test: 'caseFile',
          exact: false,
          level: UserRoles.level0,
          disabled: this.$hasRole(UserRoles.no_role),
          roles: [UserRoles.contributorIM, UserRoles.contributorFinance, UserRoles.contributor3, UserRoles.readonly, UserRoles.no_role],
        },
        {
          to: routes.householdSearch.name,
          icon: '$rctech-search-person',
          text: 'leftMenu.search_household_title',
          test: 'search_household',
          exact: false,
          level: UserRoles.level0,
          roles: [],
        },
        {
          to: routes.events.home.name,
          icon: 'mdi-calendar',
          text: 'leftMenu.events_title',
          test: 'events',
          exact: false,
          level: UserRoles.level4,
          roles: [UserRoles.contributorIM],
        },
        {
          to: routes.teams.home.name,
          icon: 'mdi-account-multiple-plus',
          text: 'leftMenu.teams_title',
          test: 'teams',
          exact: false,
          level: UserRoles.level3,
        },
        {
          to: routes.financialAssistance.home.name,
          icon: 'mdi-currency-usd',
          text: 'leftMenu.financial_title',
          test: 'financial',
          exact: false,
          level: UserRoles.level6,
        },
        {
          to: this.approvalRedirection,
          icon: 'mdi-check',
          text: 'leftMenu.approvals_title',
          test: 'approvals',
          exact: false,
          roles: [UserRoles.level3, UserRoles.level4, UserRoles.level6],
        },
        {
          to: routes.massActions.home.name,
          icon: 'mdi-file-document',
          text: 'leftMenu.mass_actions_title',
          test: 'mass_actions',
          exact: false,
          level: UserRoles.level5,
          roles: [UserRoles.contributorIM, UserRoles.contributorFinance],
        },
        {
          to: routes.assessmentTemplates.home.name,
          icon: 'mdi-chart-box',
          text: 'leftMenu.assessments_title',
          test: 'assessments',
          level: UserRoles.level6,
        },
        {
          to: routes.reporting.home.name,
          icon: 'mdi-alert-octagon',
          text: 'reporting.leftMenu.title',
          test: 'reporting',
          exact: false,
          level: UserRoles.level4,
          roles: [UserRoles.contributorIM],
        },
        {
          to: routes.appointments.home.name,
          icon: 'mdi-calendar-check',
          text: 'appointments.leftMenu.title',
          test: 'appointments',
          exact: false,
          level: UserRoles.level6,
          feature: FeatureKeys.AppointmentBooking,
        },
        {
          to: routes.systemManagement.home.name,
          icon: 'dvr',
          text: 'system_management.leftMenu.title',
          test: 'system_management',
          exact: false,
          level: UserRoles.level5,
        },
      ];

      if (this.$hasFeature(FeatureKeys.TaskManagement)) {
        tabs.splice(7, 0, tasksTab);
      }

      return tabs;
    },

    mini(): boolean {
      this.$emit('update-mini', this.smAndDown ? false : useDashboardStore().leftMenuExpanded);
      return this.smAndDown ? false : !useDashboardStore().leftMenuExpanded;
    },

    smAndDown(): boolean {
      return this.$vuetify.breakpoint.smAndDown;
    },

    show(): boolean {
      return this.smAndDown ? useDashboardStore().leftMenuVisible : true;
    },

    uiConstants() {
      return ui;
    },

    availableItems(): INavigationTab[] {
      return helpers.availableItems(this, this.items);
    },

    approvalRedirection(): string {
      if (this.$hasLevel(UserRoles.level6)) {
        return routes.approvals.templates.home.name;
      } if (this.$hasRole(UserRoles.level3) || this.$hasRole(UserRoles.level4)) {
        return routes.approvals.request.name;
      }
      return '';
    },
  },

  methods: {
    updateShow(value: boolean) {
      useDashboardStore().leftMenuVisible = value;
    },

    onClickOutside() {
      useDashboardStore().leftMenuExpanded = false;
    },

    hamburgerMenu() {
      return [document.querySelector('#hamburgerMenu')];
    },
  },
});
</script>

<style scoped lang="scss">

.v-navigation-drawer--clipped.expanded ::v-deep .v-list {
  margin-left: 12px;
}

.menu-title{
  margin-left: 32px;
}

.v-application--is-ltr .v-list-item__icon:first-child {
  margin-right: 0px !important;
}

#left-menu-dashboard {
  .v-list-item .v-list-item__title {
    font-weight: 400;
  }
}

.v-navigation-drawer--mini-variant {
  .navMenu__active::before {
    border-radius: 50%;
    width: 48px;
    height: 48px;
    margin: auto;
  }
}

 .navMenu.v-list-item .v-icon {
  color: var(--v-primary-darken1);
}

.navMenu.navMenu__active .v-icon {
  color: var(--v-secondary-base)!important;
}

.navMenu.navMenu__active .v-icon .custom-icon {
  color: var(--v-secondary-base)!important;
  caret-color: var(--v-secondary-base)!important;
}
</style>
