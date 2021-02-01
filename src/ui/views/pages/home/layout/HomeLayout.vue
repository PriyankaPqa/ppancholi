<template>
  <component :is="component" />
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import metadata from '@/ui/mixins/metadata';

import HomeLevel1 from '@/ui/views/pages/home/components/HomeLevel1.vue';
import HomeLevel2 from '@/ui/views/pages/home/components/HomeLevel2.vue';
import HomeLevel3 from '@/ui/views/pages/home/components/HomeLevel3.vue';
import HomeLevel4 from '@/ui/views/pages/home/components/HomeLevel4.vue';
import HomeLevel5 from '@/ui/views/pages/home/components/HomeLevel5.vue';
import HomeLevel6 from '@/ui/views/pages/home/components/HomeLevel6.vue';
import ContributorIM from '@/ui/views/pages/home/components/ContributorIM.vue';

export default Vue.extend({
  name: 'HomeLayout',

  components: {
    HomeLevel1,
    HomeLevel2,
    HomeLevel3,
    HomeLevel4,
    HomeLevel5,
    HomeLevel6,
    ContributorIM,
  },

  mixins: [metadata],

  computed: {
    component(): string {
      return this.$storage.user.getters.landingPage();
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
