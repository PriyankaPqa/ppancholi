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
import metadata from '@/ui/mixins/metadata';
import { RcRouterViewTransition } from '@crctech/component-library';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import { INavigationTab } from '@/types';
import routes from '@/constants/routes';

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
        level: 'level6',
      }];
    },

    showLeftMenu(): boolean {
      return (this.$route.name !== routes.systemManagement.home.name);
    },
  },

});
</script>
