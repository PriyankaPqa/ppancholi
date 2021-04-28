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
import { IShelterLocation } from '@crctech/registration-lib/src/entities/event/event.types';

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
    const res = await this.$services.events.searchMyEvents({
      filter: {
        Schedule: {
          Status: EEventStatus.Open,
        },
      },
    });
    this.events = res?.value;
  },

  methods: {
    redirect() {
      this.$router.push({ name: routes.registration.individual.name });
    },

    setEvent(event: IEventSearchData) {
      this.$storage.registration.mutations.setEvent({
        eventId: event.eventId,
        eventName: event.eventName,
        responseDetails: event.responseDetails,
        registrationLink: event.registrationLink,
        tenantId: event.tenantId,
        shelterLocations: event.shelterLocations as unknown as IShelterLocation[],
      });
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
