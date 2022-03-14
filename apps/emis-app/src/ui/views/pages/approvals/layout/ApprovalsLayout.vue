<template>
  <rc-router-view-transition />
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcRouterViewTransition } from '@libs/component-lib/components';
import metadata from '@/ui/mixins/metadata';

export default Vue.extend({
  name: 'ApprovalLayout',
  components: {
    RcRouterViewTransition,
  },
  mixins: [metadata],
  computed: {
    metaTitle(): TranslateResult {
      return this.$t('metaInfo.approval.title');
    },
    metaDescription(): TranslateResult {
      return this.$t('metaInfo.approval.description');
    },
  },
});
</script>
