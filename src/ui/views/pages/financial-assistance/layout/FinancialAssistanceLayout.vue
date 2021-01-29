<template>
  <router-view-transition />
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import metadata from '@/ui/mixins/metadata';
import RouterViewTransition from '@/ui/shared-components/RouterViewTransition.vue';

export default Vue.extend({
  name: 'FinancialAssistanceLayout',
  components: {
    RouterViewTransition,
  },
  mixins: [metadata],
  computed: {
    metaTitle(): TranslateResult {
      return this.$t('metaInfo.financial_assistance.title');
    },
    metaDescription(): TranslateResult {
      return this.$t('metaInfo.financial_assistance.description');
    },
  },
});
</script>
