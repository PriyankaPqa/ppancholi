<template>
  <rc-registration-landing-page
    :title="$t('registration.landingpage.welcome_crc')"
    :phone-number="phoneNumber"
    :can-register="canRegister">
    <div class="dropdown-wrapper">
      <v-autocomplete-with-validation
        v-model="event"
        background-color="white"
        outlined
        :items="events"
        :loading="loading"
        :item-text="(item) => $m(item.name)"
        item-value="id"
        return-object
        :attach="true"
        :label="$t('registration.landingpage.selectEvent')"
        data-test="crcRegistrationLandingPage__event" />
    </div>
  </rc-registration-landing-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { IEvent, EEventStatus } from '@/entities/event';
import { VAutocompleteWithValidation, RcRegistrationLandingPage } from '@crctech/component-library';

export default Vue.extend({
  name: 'RegistrationHome',
  components: {
    VAutocompleteWithValidation,
    RcRegistrationLandingPage,
  },
  data() {
    return {
      events: [] as Array<IEvent>,
      event: null,
      loading: false,
    };
  },

  computed: {
    canRegister(): boolean {
      return !!this.event;
    },
    phoneNumber(): string {
      if (!this.event) return '';
      return this.event.responseDetails.assistanceNumber;
    },
  },

  async mounted() {
    this.events = await this.$storage.event.actions.searchEvents({
      filter: {
        Schedule: {
          Status: EEventStatus.Open,
        },
      },
    });
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
