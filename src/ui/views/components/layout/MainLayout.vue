<template>
  <div class="selfReg__wrapper">
    <rc-page-loading v-if="loadingEvent" />
    <template v-else>
      <app-header data-test="app-header" />
      <v-main class="full-height">
        <rc-router-view-transition data-test="router-view-transition" />
      </v-main>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AppHeader from '@/ui/views/components/layout/AppHeader.vue';
import { RcPageLoading, RcRouterViewTransition } from '@crctech/component-library';

export default Vue.extend({
  name: 'MainLayout',

  components: {
    AppHeader,
    RcPageLoading,
    RcRouterViewTransition,
  },

  data() {
    return {
      loadingEvent: false,
    };
  },

  async created() {
    let { lang, eventUrl } = this.$route.params;

    // TODO Remove hard code when back-end is fixed
    lang = 'en';
    eventUrl = 'https://www.redcross.ca/test-11feb';

    this.loadingEvent = true;

    await Promise.all([
      this.$storage.registration.actions.fetchEvent(lang, eventUrl),
      this.$storage.registration.actions.fetchGenders(),
      this.$storage.registration.actions.fetchPreferredLanguages(),
      this.$storage.registration.actions.fetchPrimarySpokenLanguages(),
    ]);

    this.loadingEvent = false;
  },
});
</script>

<style scoped lang="scss">
.selfReg__wrapper {
  height: 100%;
  background-color: var(--v-grey-lighten4);
}
</style>
