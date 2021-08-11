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
        :item-text="(item) => $m(item.entity.name)"
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

import { VAutocompleteWithValidation, RcRegistrationLandingPage } from '@crctech/component-library';
import { IShelterLocationData } from '@crctech/registration-lib/src/entities/household-create';
import { IEventData as IRegistrationEventData } from '@crctech/registration-lib/src/entities/event';
import routes from '@/constants/routes';
import { EEventStatus, IEventMainInfo } from '@/entities/event';
import { tabs } from '@/store/modules/registration/tabs';

export default Vue.extend({
  name: 'RegistrationHome',

  components: {
    VAutocompleteWithValidation,
    RcRegistrationLandingPage,
  },

  data() {
    return {
      events: [] as Array<IEventMainInfo>,
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
      return this.event.entity.responseDetails.assistanceNumber;
    },
  },

  async mounted() {
    this.resetHouseholdCreate();
    this.resetRegistrationModule();
    await this.fetchDataForRegistration();
    await this.fetchActiveEvents();
  },

  methods: {
    redirect() {
      this.$router.push({ name: routes.registration.individual.name });
    },

    setEvent(event: IEventMainInfo) {
      const data = event.entity;
      const registrationEvent = {
        eventId: data.id,
        eventName: data.name,
        responseDetails: data.responseDetails,
        registrationLink: data.registrationLink,
        tenantId: data.tenantId,
        registrationLocations: data.registrationLocations,
        shelterLocations: data.shelterLocations as unknown as IShelterLocationData[],
      } as unknown as IRegistrationEventData;

      this.$storage.registration.mutations.setEvent(registrationEvent);
    },

    resetRegistrationModule() {
      this.$storage.registration.mutations.resetState(tabs());
    },

    resetHouseholdCreate() {
      this.$storage.registration.mutations.resetHouseholdCreate();
    },

    async fetchActiveEvents() {
      const res = await this.$services.events.searchMyEvents({
        filter: {
          Entity: {
            Schedule: {
              Status: EEventStatus.Open,
            },
          },
        },
        top: 999,
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
