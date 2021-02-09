<template>
  <div class="full-height grey lighten-4">
    <rc-page-loading v-if="loadingEvent" />
    <template v-else>
      <app-header data-test="app-header" />
      <v-main>
        <rc-router-view-transition data-test="router-view-transition" />
      </v-main>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AppHeader from '@/ui/views/components/layout/AppHeader.vue';
import { RcPageLoading, RcRouterViewTransition } from '@rctech/component-library';

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

    // Remove hard code when backend is fixed
    lang = 'fr';
    eventUrl = 'https://www.redcross.ca/test';

    this.loadingEvent = true;
    await this.$storage.registration.actions.fetchEvent({
      filter: {
        RegistrationLink: {
          Translation: {
            [lang]: eventUrl,
          },
        },
      },
    });
    this.loadingEvent = false;
  },
});
</script>
