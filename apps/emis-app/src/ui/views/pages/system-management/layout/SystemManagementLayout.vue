<template>
  <page-template
    :navigation-tabs="tabs"
    :show-left-menu="showLeftMenu"
    :loading="false"
    :left-menu-title="$t('system_management.leftMenu.title')"
    hide-dividers>
    <rc-router-view-transition />
  </page-template>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcRouterViewTransition } from '@libs/component-lib/components';
import metadata from '@/ui/mixins/metadata';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import { INavigationTab } from '@libs/shared-lib/types';
import routes from '@/constants/routes';
import { UserRoles } from '@libs/entities-lib/user';

export default Vue.extend({
  name: 'SystemManagementLayout',

  components: {
    PageTemplate,
    RcRouterViewTransition,
  },

  mixins: [metadata],

  computed: {
    metaTitle(): TranslateResult {
      return this.$t('metaInfo.system_management.title');
    },

    metaDescription(): TranslateResult {
      return this.$t('metaInfo.system_management.description');
    },

    tabs(): Array<INavigationTab> {
      return [{
        text: this.$t('system_management.leftMenu.lists_title'),
        test: 'systemManagement__menu__optionsLists',
        to: routes.systemManagement.lists.name,
        exact: false,
        level: UserRoles.level6,
      }, {
        text: this.$t('system_management.leftMenu.user_accounts_title'),
        test: 'systemManagement__menu__userAccounts',
        to: routes.systemManagement.userAccounts.home.name,
        exact: false,
        level: UserRoles.level5,
      }, {
        text: this.$t('system_management.lists.roles'),
        test: 'systemManagement__menu__roles',
        to: routes.systemManagement.roles.name,
        exact: false,
        level: UserRoles.level6,
      }, {
        text: this.$t('system_management.lists.branding'),
        test: 'systemManagement__menu__branding',
        to: routes.systemManagement.branding.name,
        exact: false,
        level: UserRoles.level6,
      }, {
        text: this.$t('system_management.lists.tenantSettings'),
        test: 'systemManagement__menu__tenantSettings',
        to: routes.systemManagement.tenantSettings.name,
        exact: false,
        level: UserRoles.level6,
      }, {
        text: this.$t('system_management.card.features.title'),
        test: 'systemManagement__menu__features',
        to: routes.systemManagement.features.name,
        exact: false,
        level: UserRoles.level6,
      }];
    },

    showLeftMenu(): boolean {
      return (this.$route.name !== routes.systemManagement.home.name);
    },
  },

});
</script>
