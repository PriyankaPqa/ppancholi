<template>
  <rc-router-view-transition />
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcRouterViewTransition } from '@libs/component-lib/components';
import metadata from '@/ui/mixins/metadata';

export default Vue.extend({
  name: 'TeamsLayout',
  components: {
    RcRouterViewTransition,
  },
  mixins: [metadata],
  computed: {
    metaTitle(): TranslateResult {
      return this.$t('metaInfo.team_management.title');
    },
    metaDescription(): TranslateResult {
      return this.$t('metaInfo.team_management.description');
    },
  },
});
</script>
