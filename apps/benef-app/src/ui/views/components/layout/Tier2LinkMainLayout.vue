<template>
  <div class="selfReg__wrapper">
    <rc-page-loading v-if="fetchingData" />
    <template v-else>
      <app-header data-test="app-header" />
      <v-main class="full-height">
        <individual />
      </v-main>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageLoading } from '@libs/component-lib/components';
import _isEmpty from 'lodash/isEmpty';
import AppHeader from '@/ui/views/components/layout/AppHeader.vue';
import { httpClient } from '@/services/httpClient';
import helpers from '@/ui/helpers';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { useRegistrationStore } from '@/pinia/registration/registration';
import Individual from '@/ui/views/pages/registration/individual/Individual.vue';

export default Vue.extend({
  name: 'Tier2LinkMainLayout',

  components: {
    AppHeader,
    RcPageLoading,
    Individual,
  },

  data() {
    return {
      fetchingData: false,
    };
  },

  async created() {
    this.fetchingData = true;
    if (await this.initializeEvent()) {
      await this.fetchData();
    }
    this.fetchingData = false;
  },

  methods: {
    async initializeEvent() : Promise<boolean> {
      const { caseFileId } = this.$route.params;

      const currentdomain = helpers.getCurrentDomain(this.$route);

      const tenantId = await this.$services.publicApi.getTenantByRegistrationDomain(currentdomain);

      httpClient.setHeadersTenant(tenantId);
      await useRegistrationStore().fetchDetailsForTier2Process(caseFileId);
      const event = useRegistrationStore().getEvent();

      this.$appInsights.setBasicContext({ tenantId });
      this.$appInsights.setBasicContext({ event });

      if (_isEmpty(event)) {
        this.$appInsights.trackTrace('trying to register with invalid event', {}, 'MainLayout', 'initializeEvent');
        window.location.replace(this.$t('registration.redirection_link') as string);
        return false;
      }
      return true;
    },

    async fetchData() {
      return Promise.all([
        useTenantSettingsStore().fetchPublicFeatures(),
        useTenantSettingsStore().fetchBranding(),
        useTenantSettingsStore().validateCaptchaAllowedIpAddress(),
      ]).catch((error) => {
        this.$appInsights.trackException(error, {}, 'Tier2LinkMainLayout', 'fetchData');
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
