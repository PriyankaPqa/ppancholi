<template>
  <v-container fluid fill-height class="pa-0">
    <router-view-transition />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import metadata from '@/ui/mixins/metadata';
import RouterViewTransition from '@/ui/shared-components/RouterViewTransition.vue';

export default Vue.extend({
  name: 'EventsLayout',
  components: {
    RouterViewTransition,
  },
  mixins: [metadata],
  computed: {
    metaTitle(): TranslateResult {
      return this.$t('metaInfo.dashboard_event.title');
    },
    metaDescription(): TranslateResult {
      return this.$t('metaInfo.dashboard_event.description');
    },
  },
});
</script>
