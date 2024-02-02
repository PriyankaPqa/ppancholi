<template>
  <rc-router-view-transition />
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcRouterViewTransition } from '@libs/component-lib/components';
import metadata from '@/ui/mixins/metadata';

export default Vue.extend({
  name: 'AppointmentsLayout',
  components: {
    RcRouterViewTransition,
  },
  mixins: [metadata],
  computed: {
    metaTitle(): TranslateResult {
      return this.$t('metaInfo.dashboard_appointment.title');
    },
    metaDescription(): TranslateResult {
      return this.$t('metaInfo.dashboard_appointment.description');
    },
  },
});
</script>
