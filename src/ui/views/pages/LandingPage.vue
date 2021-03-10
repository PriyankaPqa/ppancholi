<template>
  <rc-registration-landing-page :title="$t('registration.landingpage.welcome_self')" :phone-number="phoneNumber" @redirect="redirect" />
</template>

<script lang="ts">
import Vue from 'vue';
import { RcRegistrationLandingPage } from '@crctech/component-library';
import routes from '@/constants/routes';
import { IEvent } from '@/entities/event';

export default Vue.extend({
  name: 'LandingPage',

  components: {
    RcRegistrationLandingPage,
  },

  computed: {
    phoneNumber() {
      const event: IEvent = this.$storage.registration.getters.event();
      return event.responseDetails.assistanceNumber;
    },
  },

  methods: {
    redirect() {
      this.$router.push({ name: routes.individual.name });
    },
  },
});
</script>
