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
      <v-tooltip
        v-for="(item, index) in availableItems"
        :key="index"
        right
        :disabled="!mini"
        :open-delay="uiConstants.tooltip_open_delay">
        <template #activator="{ on } ">
          <v-list-item
            link
            class="navMenu"
            active-class="navMenu__active"
            :to="{ name: item.to }"
            :exact="typeof item.exact === 'undefined' ? true : item.exact"
            :data-test="item.test"
            v-on="on"
            @click="onClickOutside">
            <v-list-item-icon>
              <v-icon color="primary darken-1">
                {{ item.icon }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content><v-list-item-title>{{ $t(item.text) }}</v-list-item-title></v-list-item-content>
          </v-list-item>
        </template>
        <span>{{ $t(item.text) }}</span>
      </v-tooltip>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import { ui } from '@/constants/ui';
import { INavigationTab } from '@/types';

export default Vue.extend({
  name: 'LeftMenu',

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
          text: 'dashboard.leftMenu.home_title',
          test: 'home',
          level: 'level1',
        },
        {
          to: routes.caseFile.home.name,
          icon: 'mdi-clipboard-text',
          text: 'dashboard.leftMenu.caseFiles_title',
          test: 'caseFile',
          exact: false,
          level: 'level1',
        },
        {
          to: routes.teams.home.name,
          icon: 'mdi-account-multiple-plus',
          text: 'dashboard.leftMenu.teams_title',
          test: 'teams',
          exact: false,
          level: 'level3',
        },
        {
          to: routes.approvals.home.name,
          icon: 'mdi-check',
          text: 'dashboard.leftMenu.approvals_title',
          test: 'approvals',
          exact: false,
          level: 'level3',
        },
        // {
        //   to: routes.events.home.name,
        //   icon: 'mdi-calendar',
        //   text: 'dashboard.leftMenu.events_title',
        //   test: 'events',
        //   exact: false,
        //   permission: null,
        // },
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
      return this.items.filter((item) => !item.level || this.$hasLevel(item.level));
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
