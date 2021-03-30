<template>
  <div class="selfReg__wrapper">
    <rc-page-loading v-if="fetchingData" />
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
import _isEmpty from 'lodash/isEmpty';
import { Route, NavigationGuardNext } from 'vue-router';
import store from '@/store/store';
import { i18n } from '@/ui/plugins';

export default Vue.extend({
  name: 'MainLayout',

  components: {
    AppHeader,
    RcPageLoading,
    RcRouterViewTransition,
  },
  async beforeRouteEnter(to: Route, from: Route, next: NavigationGuardNext) {
    const { lang, registrationLink } = to.params;
    const event = await store.dispatch('registration/fetchEvent', { lang, registrationLink });
    if (_isEmpty(event)) {
      window.location.replace(i18n.t('registration.redirection_link') as string);
    } else {
      next();
    }
  },

  data() {
    return {
      fetchingData: false,
    };
  },

  async created() {
    await this.fetchData();
  },

  methods: {
    async fetchData() {
      this.fetchingData = true;

      await Promise.all([
        this.$storage.registration.actions.fetchGenders(),
        this.$storage.registration.actions.fetchPreferredLanguages(),
        this.$storage.registration.actions.fetchPrimarySpokenLanguages(),
      ]);

      this.fetchingData = false;
    },
  },
});
</script>

<style scoped lang="scss">
.selfReg__wrapper {
  height: 100%;
  background-color: var(--v-grey-lighten4);
  display: inline-flex;
}
</style>
