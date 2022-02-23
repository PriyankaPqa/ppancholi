<template>
  <rc-router-view-transition />
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcRouterViewTransition } from '@crctech/component-library';
import metadata from '@/ui/mixins/metadata';

export default Vue.extend({
  name: 'CaseFileLayout',
  components: {
    RcRouterViewTransition,
  },
  mixins: [metadata],
  computed: {
    metaTitle(): TranslateResult {
      return this.$t('metaInfo.dashboard_caseFile.title');
    },
    metaDescription(): TranslateResult {
      return this.$t('metaInfo.dashboard_caseFile.description');
    },
  },
});
</script>
