<template>
  <v-navigation-drawer
    id="left-menu-dashboard"
    v-click-outside="{ handler: onClickOutside, include: hamburgerMenu }"
    :value="show"
    :mini-variant="mini"
    :class="{expanded: !mini}"
    mini-variant-width="80"
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
            <v-list-item-icon>
              <v-icon color="primary darken-1" :disabled="item.disabled">
                {{ item.icon }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content><v-list-item-title>{{ $t(item.text) }}</v-list-item-title></v-list-item-content>
          </v-list-item>
        </template>
        {{ $t(item.text) }}
      </rc-tooltip>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcTooltip } from '@crctech/component-library';
import routes from '@/constants/routes';
import { ui } from '@/constants/ui';
import { INavigationTab } from '@/types';
import { NO_ROLE } from '@/entities/user';
import { FeatureKeys } from '@/entities/tenantSettings';

export default Vue.extend({
  name: 'LeftMenu',

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
      return [
        {
          to: routes.home.name,
          icon: 'mdi-home',
          text: 'leftMenu.home_title',
          test: 'home',
          level: 'level1',
          roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly', NO_ROLE],
        },
        {
          to: routes.caseFile.home.name,
          icon: 'mdi-clipboard-text',
          text: 'leftMenu.caseFiles_title',
          test: 'caseFile',
          exact: false,
          level: 'level1',
          disabled: this.$hasRole(NO_ROLE),
          roles: ['contributorIM', 'contributorFinance', 'contributor3', 'readonly', NO_ROLE],
        },
        {
          to: routes.events.home.name,
          icon: 'mdi-calendar',
          text: 'leftMenu.events_title',
          test: 'events',
          exact: false,
          level: 'level4',
          roles: ['contributorIM'],
        },
        {
          to: routes.teams.home.name,
          icon: 'mdi-account-multiple-plus',
          text: 'leftMenu.teams_title',
          test: 'teams',
          exact: false,
          level: 'level3',
        },
        {
          to: routes.financialAssistance.home.name,
          icon: 'mdi-currency-usd',
          text: 'leftMenu.financial_title',
          test: 'financial',
          exact: false,
          level: 'level6',
        },
        {
          to: this.approvalRedirection,
          icon: 'mdi-check',
          text: 'leftMenu.approvals_title',
          test: 'approvals',
          exact: false,
          roles: ['level3', 'level4', 'level6'],
        },
        {
          to: routes.massActions.home.name,
          icon: 'mdi-file-document',
          text: 'leftMenu.mass_actions_title',
          test: 'mass_actions',
          exact: false,
          level: 'level6',
          roles: ['contributorIM', 'contributorFinance'],
          feature: FeatureKeys.MassAction,
        },
        {
          to: routes.assessments.home.name,
          icon: 'mdi-chart-box',
          text: 'leftMenu.assessments_title',
          test: 'assessments',
          level: 'level6',
        },
        {
          to: routes.systemManagement.home.name,
          icon: 'dvr',
          text: 'system_management.leftMenu.title',
          test: 'system_management',
          exact: false,
          level: 'level5',
        },
      ];
    },

    mini(): boolean {
      this.$emit('update-mini', this.smAndDown ? false : this.$store.state.dashboard.leftMenuExpanded);
      return this.smAndDown ? false : !this.$store.state.dashboard.leftMenuExpanded;
    },

    smAndDown(): boolean {
      return this.$vuetify.breakpoint.smAndDown;
    },

    show(): boolean {
      return this.smAndDown ? this.$store.state.dashboard.leftMenuVisible : true;
    },

    uiConstants() {
      return ui;
    },

    availableItems(): INavigationTab[] {
      return this.items.filter((item) => {
        let levelCheck = false;
        let rolesCheck = false;
        let featureCheck = true;

        if (item.level) {
          levelCheck = this.$hasLevel(item.level);
        }

        if (item.roles) {
          rolesCheck = item.roles.some((r: string) => this.$hasRole(r));
        }

        if (item.feature) {
          featureCheck = this.$hasFeature(item.feature);
        }

        return (levelCheck || rolesCheck) && featureCheck;
      });
    },

    approvalRedirection(): string {
      if (this.$hasLevel('level6')) {
        return routes.approvals.templates.name;
      } if (this.$hasRole('level3') || this.$hasRole('level4')) {
        return routes.approvals.request.name;
      }
      return '';
    },
  },

  methods: {
    updateShow(value: boolean) {
      this.$storage.dashboard.mutations.setProperty({
        property: 'leftMenuVisible',
        value,
      });
    },

    onClickOutside() {
      this.$storage.dashboard.mutations.setProperty({
        property: 'leftMenuExpanded',
        value: false,
      });
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

.navMenu__active .v-icon {
  color: var(--v-secondary-base)!important;
}
</style>
