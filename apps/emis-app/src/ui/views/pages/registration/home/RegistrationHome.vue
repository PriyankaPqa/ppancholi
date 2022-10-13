<template>
  <rc-registration-landing-page
    :title="$t('registration.landingpage.welcome_crc')"
    :phone-number="assistanceNumber"
    :can-register="canRegister"
    @redirect="redirect">
    <div class="dropdown-wrapper">
      <events-selector
        v-model="event"
        async-mode
        return-object
        :label="$t('registration.landingpage.selectEvent')"
        data-test="crcRegistrationLandingPage__event"
        @change="setEvent($event)" />
    </div>
  </rc-registration-landing-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { RcRegistrationLandingPage } from '@libs/component-lib/components';
import { IShelterLocationData } from '@libs/entities-lib/household-create';
import { IEvent, IEventData as IRegistrationEventData } from '@libs/entities-lib/registration-event';
import routes from '@/constants/routes';
import { tabs } from '@/store/modules/registration/tabs';
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';

export default Vue.extend({
  name: 'RegistrationHome',

  components: {
    EventsSelector,
    RcRegistrationLandingPage,
  },

  data() {
    return {
      event: null,
    };
  },

  computed: {
    canRegister(): boolean {
      return !!this.event;
    },

    assistanceNumber(): string {
      if (!this.event) {
        return '';
      }
      return this.event.responseDetails.assistanceNumber;
    },
  },

  async mounted() {
    this.resetHouseholdCreate();
    this.resetRegistrationModule();
    await this.fetchDataForRegistration();
  },

  methods: {
    redirect() {
      this.$router.push({ name: routes.registration.individual.name });
    },
    setEvent(event: IEvent) {
      if (!event) {
        return;
      }
      const registrationEvent = {
        id: event.id,
        name: event.name,
        responseDetails: event.responseDetails,
        registrationLink: event.registrationLink,
        tenantId: event.tenantId,
        registrationLocations: event.registrationLocations,
        shelterLocations: event.shelterLocations as unknown as IShelterLocationData[],
      } as unknown as IRegistrationEventData;

      this.$storage.registration.mutations.setEvent(registrationEvent);
    },

    resetRegistrationModule() {
      this.$storage.registration.mutations.resetState(tabs());
    },

    resetHouseholdCreate() {
      this.$storage.registration.mutations.resetHouseholdCreate();
    },

    async fetchDataForRegistration() {
      this.$storage.registration.actions.fetchGenders();
      this.$storage.registration.actions.fetchPreferredLanguages();
      this.$storage.registration.actions.fetchPrimarySpokenLanguages();
    },

  },
});
</script>

<style scoped lang="scss">
.dropdown-wrapper {
  width: 100%;
  max-width: 960px;
  margin: 8px auto 0px;
}
</style>
