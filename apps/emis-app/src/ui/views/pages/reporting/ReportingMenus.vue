<template>
  <page-template
    data-test="reporting-menus"
    :loading="false"
    :left-menu-title="$t('reporting.leftMenu.title')"
    :navigation-tabs="accessibleTabs">
    <template slot="default">
      <router-view :key="$route.fullPath" />
    </template>
  </page-template>
</template>

<script lang="ts">
import Vue from 'vue';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import { ReportingPages } from './reportingPages';

export default Vue.extend({
  name: 'ReportingMenus',

  components: {
    PageTemplate,
  },

  data() {
    return {
      reportingMenus: new ReportingPages(),
    };
  },

  computed: {
    accessibleTabs() {
      return this.reportingMenus.availableTabs(this);
    },
  },
});
</script>
