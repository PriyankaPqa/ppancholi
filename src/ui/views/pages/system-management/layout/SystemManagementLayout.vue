<template>
  <page-template
    :navigation-tabs="tabs"
    :show-left-menu="showLeftMenu"
    :loading="false"
    :left-menu-title="$t('dashboard.system_management.leftMenu.title')"
    hide-dividers>
    <rc-router-view-transition />
  </page-template>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import metadata from '@/ui/mixins/metadata';
import { RcRouterViewTransition } from '@rctech/component-library';
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
      return this.$t('metaInfo.dashboard.system_management.title');
    },
    metaDescription(): TranslateResult {
      return this.$t('metaInfo.dashboard.system_management.description');
    },

    tabs(): Array<INavigationTab> {
      return [

      ];
    },

    showLeftMenu(): boolean {
      return (this.$route.name !== routes.systemManagement.home.name);
    },
  },

});
</script>
