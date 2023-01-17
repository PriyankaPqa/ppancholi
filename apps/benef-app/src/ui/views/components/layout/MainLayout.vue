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
import { RcPageLoading, RcRouterViewTransition } from '@libs/component-lib/components';
import _isEmpty from 'lodash/isEmpty';
import { EEventStatus, IEvent } from '@libs/entities-lib/registration-event';
import AppHeader from '@/ui/views/components/layout/AppHeader.vue';
import { i18n } from '@/ui/plugins';
import { httpClient } from '@/services/httpClient';
import helpers from '@/ui/helpers';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';

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
    if (await this.initializeEvent()) {
      await this.fetchData();
    }
  },

  methods: {
    async initializeEvent() : Promise<boolean> {
      const { lang, registrationLink } = this.$route.params;

      const currentdomain = helpers.getCurrentDomain(this.$route);

      const tenantId = await this.$services.publicApi.getTenantByRegistrationDomain(currentdomain);

      httpClient.setHeadersTenant(tenantId);
      const event: IEvent = await this.$storage.registration.actions.fetchEvent(lang, registrationLink);

      this.$appInsights.setBasicContext({ tenantId });
      this.$appInsights.setBasicContext({ event });

      if (_isEmpty(event) || !event.selfRegistrationEnabled || event.schedule.status !== EEventStatus.Open) {
        this.$appInsights.trackTrace('trying to register with invalid event', {}, 'MainLayout', 'initializeEvent');
        window.location.replace(i18n.t('registration.redirection_link') as string);
        return false;
      }

      if (event.registrationAssessments?.length) {
        try {
          const assessment = await this.$services.assessmentForms.getForBeneficiary(event.registrationAssessments[0].assessmentId);
          this.$storage.registration.mutations.setAssessmentToComplete({ assessmentForm: assessment, registrationAssessment: event.registrationAssessments[0] });
        } catch {
          // forms are not available
          this.$storage.registration.mutations.setAssessmentToComplete(null);
        }
      } else {
        this.$storage.registration.mutations.setAssessmentToComplete(null);
      }

      httpClient.setHeadersTenant(event.tenantId);
      return true;
    },

    async fetchData() {
      await Promise.all([
        this.$storage.registration.actions.fetchGenders(),
        this.$storage.registration.actions.fetchPreferredLanguages(),
        this.$storage.registration.actions.fetchPrimarySpokenLanguages(),
        useTenantSettingsStore().fetchPublicFeatures(),
        useTenantSettingsStore().fetchBranding(),
        useTenantSettingsStore().validateCaptchaAllowedIpAddress(),
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
