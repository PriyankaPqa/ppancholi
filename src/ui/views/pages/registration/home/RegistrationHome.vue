<template>
  <rc-registration-landing-page
    :title="$t('registration.landingpage.welcome_crc')"
    :phone-number="assistanceNumber"
    :can-register="canRegister"
    @redirect="redirect">
    <div class="dropdown-wrapper">
      <v-autocomplete-with-validation
        v-model="event"
        background-color="white"
        outlined
        :items="events"
        :loading="loading"
        :item-text="(item) => $m(item.eventName)"
        item-value="eventId"
        return-object
        :attach="true"
        :label="$t('registration.landingpage.selectEvent')"
        data-test="crcRegistrationLandingPage__event"
        @change="setEvent($event)" />
    </div>
  </rc-registration-landing-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { IEventSearchData, EEventStatus } from '@/entities/event';

import { VAutocompleteWithValidation, RcRegistrationLandingPage } from '@crctech/component-library';
import routes from '@/constants/routes';
import { IShelterLocationData } from '@crctech/registration-lib/src/entities/household-create';
import { IEventData as IRegistrationEventData } from '@crctech/registration-lib/src/entities/event';
import { tabs } from '@/store/modules/registration/tabs';

export default Vue.extend({
  name: 'RegistrationHome',

  components: {
    VAutocompleteWithValidation,
    RcRegistrationLandingPage,
  },

  data() {
    return {
      events: [] as Array<IEventSearchData>,
      event: null,
      loading: false,
    };
  },

  computed: {
    canRegister(): boolean {
      return !!this.event;
    },

    assistanceNumber(): string {
      if (!this.event) return '';
      return this.event.responseDetails.assistanceNumber;
    },
  },

  async mounted() {
    this.resetHouseholdModule();
    this.resetRegistrationModule();
    await this.fetchDataForRegistration();
    await this.fetchActiveEvents();
  },

  methods: {
    redirect() {
      this.$router.push({ name: routes.registration.individual.name });
    },

    setEvent(event: IEventSearchData) {
      const registrationEvent = {
        eventId: event.eventId,
        eventName: event.eventName,
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

    resetHouseholdModule() {
      this.$storage.household.mutations.resetState();
    },

    async fetchActiveEvents() {
      const res = await this.$services.events.searchMyEvents({
        filter: {
          Schedule: {
            Status: EEventStatus.Open,
          },
        },
      });
      this.events = res?.value;
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
