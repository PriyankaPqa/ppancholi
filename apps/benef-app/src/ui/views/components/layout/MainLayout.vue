<template>
  <div class="selfReg__wrapper" @mousemove="mouseMoved">
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
import _throttle from 'lodash/throttle';
import AppHeader from '@/ui/views/components/layout/AppHeader.vue';
import { httpClient } from '@/services/httpClient';
import helpers from '@/ui/helpers';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { EEventStatus } from '@libs/entities-lib/event';

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
      previousMouseCoordinates: null as { x: number, y: number },
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
      const event = await useRegistrationStore().fetchEvent(lang, registrationLink);

      this.$appInsights.setBasicContext({ tenantId });
      this.$appInsights.setBasicContext({ event });

      if (_isEmpty(event) || !event.selfRegistrationEnabled || event.schedule.status !== EEventStatus.Open) {
        this.$appInsights.trackTrace('trying to register with invalid event', {}, 'MainLayout', 'initializeEvent');
        window.location.replace(this.$t('registration.redirection_link') as string);
        return false;
      }

      if (event.registrationAssessments?.length) {
        try {
          const assessment = await this.$services.assessmentForms.getForBeneficiary(event.registrationAssessments[0].assessmentId);
          useRegistrationStore().setAssessmentToComplete({ assessmentForm: assessment, registrationAssessment: event.registrationAssessments[0] });
        } catch {
          // forms are not available
          useRegistrationStore().setAssessmentToComplete(null);
        }
      } else {
        useRegistrationStore().setAssessmentToComplete(null);
      }
      httpClient.setHeadersTenant(tenantId);
      return true;
    },

    async fetchData() {
      await Promise.all([
        useRegistrationStore().fetchGenders(),
        useRegistrationStore().fetchPreferredLanguages(),
        useRegistrationStore().fetchPrimarySpokenLanguages(),
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
    mouseMoved(event: MouseEvent) {
      if (!this.previousMouseCoordinates) {
        useRegistrationStore().selfRegistrationLog.mouseDistance = 0;
        useRegistrationStore().selfRegistrationLog.mouseTime = 0;
      } else {
        useRegistrationStore().selfRegistrationLog.mouseDistance
              += Math.abs(this.previousMouseCoordinates.x - event.clientX) + Math.abs(this.previousMouseCoordinates.y - event.clientY);
        this.throttleMouseMove();
      }
      this.previousMouseCoordinates = { x: event.clientX, y: event.clientY };
    },

    throttleMouseMove: _throttle(() => {
      useRegistrationStore().selfRegistrationLog.mouseTime += 1;
    }, 1000, { leading: true, trailing: false }),
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
