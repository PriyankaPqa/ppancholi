<template>
  <v-container fluid fill-height class="pa-0 page-detail-container">
    <rc-page-loading v-if="loading" data-test="loading" />
    <div v-else class="full-height pageTemplate__container">
      <secondary-left-menu
        v-if="showLeftMenu"
        ref="secondaryLeftMenu"
        :class="{ 'fixed-menu': leftMenuFixed }"
        :validation-tabs="validationTabs"
        :validation-store="validationStore"
        :title="leftMenuTitle"
        :subtitle="leftMenuSubtitle"
        :tabs="navigationTabsFilteredForPermissions"
        :hide-dividers="hideDividers"
        :hide-back-button="hideBackButton"
        @update-tab="$emit('update-tab', $event)"
        @click:tab="$emit('click:tab', $event)"
        @backButtonClicked="back()">
        <!-- @slot Slot of secondary left menu -->
        <template slot="default">
          <slot name="left-menu" />
        </template>
        <!-- @slot Slot bottom of secondary left menu -->
        <template slot="bottom" />
      </secondary-left-menu>

      <div :class="{ 'pageTemplate__content': true, 'fixed-content': leftMenuFixed, 'left__menu': showLeftMenu}">
        <slot name="default" />
      </div>

      <secondary-right-menu v-if="showRightMenu">
        <template slot="right-menu-top">
          <slot name="page-right-menu-top" />
        </template>
        <template slot="right-menu-default">
          <slot name="page-right-menu-default" />
        </template>
      </secondary-right-menu>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageLoading } from '@crctech/component-library';
import SecondaryLeftMenu from '@/ui/views/components/layout/SecondaryLeftMenu.vue';
import SecondaryRightMenu from '@/ui/views/components/layout/SecondaryRightMenu.vue';
import { INavigationTab } from '@/types';
import routes from '@/constants/routes';

export default Vue.extend({
  name: 'PageTemplate',
  components: {
    RcPageLoading,
    SecondaryLeftMenu,
    SecondaryRightMenu,
  },
  props: {
    /**
     * Whether to show or not the right menu
     */
    showRightMenu: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to show or not the left menu
     */
    showLeftMenu: {
      type: Boolean,
      default: true,
    },
    /**
     * Array containing a collection of tabs displayed in the left menu
     * @values {text: '', test: 'case-file-activity', icon: 'mdi-clipboard-text', disabled: false, to: routes.xxx.name, exact: true}
     */
    navigationTabs: {
      type: Array,
      default: () => [] as Array<INavigationTab>,
    },
    /**
     * Whether the tabs use validation
     */
    validationTabs: {
      type: Boolean,
      default: false,
    },
    /**
     * State of load
     */
    loading: {
      type: Boolean,
      required: true,
    },
    /**
     * Left menu title
     */
    leftMenuTitle: {
      type: String,
      default: '',
    },
    /**
     * Left menu sub title
     */
    leftMenuSubtitle: {
      type: String,
      default: '',
    },
    /**
     * Whether to have the left menu in a fixed position
     */
    leftMenuFixed: {
      type: Boolean,
      default: false,
    },
    /**
     * The module to store validation state
     */
    validationStore: {
      type: String,
      default: '',
    },
    /**
     * Hide the dividers
     */
    hideDividers: {
      type: Boolean,
      default: false,
    },

    /**
     * Hide the back button
     */
    hideBackButton: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    navigationTabsFilteredForPermissions(): Array<INavigationTab> {
      return this.navigationTabs as Array<INavigationTab>;
      // return this.navigationTabs.filter((tab) => {
      //   if ((tab as INavigationTab).permission) {
      //     return this.$can((tab as INavigationTab).permission);
      //   }
      //   return true;
      // }) as Array<INavigationTab>;
    },
  },
  methods: {
    /**
     * Go one step back in router history
     * @public
     */
    back(): void {
      const comingFromOutside = localStorage.getItem('fromOutside') === 'true';
      comingFromOutside ? this.redirectFromOutside() : this.redirectBack();
    },
    redirectFromOutside(): void {
      // If beneficiary profile and from outside
      // if (this.$route.name === routes.beneficiaryProfileEdit.name) {
      //   this.$router.replace({ name: routes.caseFiles.name });
      // } else {
      const routeName = this.getBackRoute();

      if (routeName) {
        this.$router.replace({ name: routeName });
      } else {
        this.$router.replace({ name: routes.home.name });
      }
      // }
    },
    redirectBack(): void {
      const routeName = this.$route.params.backRouteName || this.getBackRoute();

      if (routeName) {
        this.$router.replace({ name: routeName });
      } else {
        this.$router.go(-1);
      }
    },
    getBackRoute(): string | null {
      switch (this.$route.name) {
        // case routes.eventDetailSummary.name:
        //   return routes.events.name;
        //
        // case routes.teams_detail.name:
        //   return routes.teams.name;
        //
        // case routes.system_management_lists.name:
        //   return routes.system_management.name;
        //
        // case routes.system_management_user_accounts.name:
        //   return routes.system_management.name;
        //
        // case routes.system_management_supported_languages.name:
        //   return routes.system_management.name;
        //
        // case routes.system_management_roles.name:
        //   return routes.system_management.name;

        default:
          return null;
      }
    },
  },
});
</script>

<style scoped lang="scss">
$leftmenu_width: 208px;
.pageTemplate__container {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.pageTemplate__content {
  flex: 1;
  max-width: 100%;
  & .left__menu {
    max-width: calc(100% - #{$leftmenu_width});
  }
}

.list {
  & .v-list-item {
    border-left: 2px solid transparent;
  }
  & .active {
    color: var(--v-black-base) !important;
    border-color: var(--v-secondary-base);
    & ::v-deep .v-icon {
      color: var(--v-secondary-base) !important;
    }
  }
}

.fixed-content {
  padding-left: $leftmenu_width;
}

.fixed-menu {
  position: fixed;
  height: 100%;
}
</style>
