<template>
  <rc-router-view-transition />
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import metadata from '@/ui/mixins/metadata';
import { RcRouterViewTransition } from '@crctech/component-library';

export default Vue.extend({
  name: 'ReportsLayout',
  components: {
    RcRouterViewTransition,
  },
  mixins: [metadata],
  computed: {
    metaTitle(): TranslateResult {
      return this.$t('metaInfo.reports.title');
    },
    metaDescription(): TranslateResult {
      return this.$t('metaInfo.reports.description');
    },
  },
});
</script>
