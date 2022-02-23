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
import { i18n } from '@/ui/plugins';
import { httpClient } from '@/services/httpClient';
import { EEventStatus, IEvent } from '@libs/registration-lib/entities/event';
import { SUPPORTED_LANGUAGES } from '@/constants/trans';

export default Vue.extend({
  name: 'MainLayout',

  components: {
    AppHeader,
    RcPageLoading,
    RcRouterViewTransition,
  },

  data() {
    return {
      fetchingData: false,
    };
  },

  async created() {
    this.fetchingData = true;
    if (await this.verifyLocation()) {
      await this.fetchData();
    }
  },

  methods: {
    async verifyLocation() : Promise<boolean> {
      const { lang, registrationLink } = this.$route.params;

      const currentdomain = this.getCurrentDomain();

      const tenantId = await this.$services.publicApi.getTenantByRegistrationDomain(currentdomain);

      httpClient.setHeadersTenant(tenantId);
      const event: IEvent = await this.$storage.registration.actions.fetchEvent(lang, registrationLink);

      this.$appInsights.setBasicContext({ tenantId });
      this.$appInsights.setBasicContext({ event });

      if (_isEmpty(event) || !event.selfRegistrationEnabled || event.schedule.status !== EEventStatus.Open) {
        this.$appInsights.trackTrace('trying to register with invalid event', {}, 'MainLayout', 'verifyLocation');
        window.location.replace(i18n.t('registration.redirection_link') as string);
        return false;
      }

      httpClient.setHeadersTenant(event.tenantId);
      return true;
    },

    getCurrentDomain() : string {
      let d = window.location.hostname;
      if (d.startsWith('localhost') || (/beneficiary-\d+\.crc-tech\.ca/i).test(d)) {
        d = 'beneficiary-dev.crc-tech.ca';
      }
      return d;
    },

    async fetchData() {
      await Promise.all([
        this.$storage.registration.actions.fetchGenders(),
        this.$storage.registration.actions.fetchPreferredLanguages(),
        this.$storage.registration.actions.fetchPrimarySpokenLanguages(),
        this.$storage.tenantSettings.actions.fetchPublicFeatures(),
        this.$storage.tenantSettings.actions.fetchBranding(),
        SUPPORTED_LANGUAGES.map((lang) => this.$storage.tenantSettings.actions.fetchLogoUrl(lang)),
      ]).then(() => {
        this.fetchingData = false;
      }).catch((error) => {
        this.fetchingData = false;
        this.$appInsights.trackException(error, {}, 'MainLayout', 'fetchData');
      });
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
