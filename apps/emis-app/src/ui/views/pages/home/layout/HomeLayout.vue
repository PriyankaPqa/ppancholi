<template>
  <component :is="component" />
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import metadata from '@/ui/mixins/metadata';

import DashboardCaseFile from '@/ui/views/pages/home/components/DashboardCaseFile.vue';
import HomeLevel3 from '@/ui/views/pages/home/components/HomeLevel3.vue';
import HomeLevel4 from '@/ui/views/pages/home/components/HomeLevel4.vue';
import HomeLevel5 from '@/ui/views/pages/home/components/HomeLevel5.vue';
import HomeLevel6 from '@/ui/views/pages/home/components/HomeLevel6.vue';
import HomeNoRole from '@/ui/views/pages/home/components/HomeNoRole.vue';
import HomePartners from '@/ui/views/pages/home/components/HomePartners.vue';
import { useUserStore } from '@/pinia/user/user';
import HomeContributorIM from '@/ui/views/pages/home/components/HomeContributorIM.vue';

export default Vue.extend({
  name: 'HomeLayout',

  components: {
    DashboardCaseFile,
    HomeLevel3,
    HomeLevel4,
    HomeLevel5,
    HomeLevel6,
    HomeNoRole,
    HomePartners,
    HomeContributorIM,
  },

  mixins: [metadata],

  computed: {
    component(): string {
      return useUserStore().getLandingPage();
    },
    metaTitle(): TranslateResult {
      return this.$t('metaInfo.dashboard_home.title');
    },
    metaDescription(): TranslateResult {
      return this.$t('metaInfo.dashboard_home.description');
    },
  },
});
</script>
