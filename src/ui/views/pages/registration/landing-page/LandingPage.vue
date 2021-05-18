<template>
  <rc-registration-landing-page
    :title="$t('registration.landingpage.welcome_self')"
    :phone-number="phoneNumber"
    @redirect="redirect" />
</template>

<script lang="ts">
import Vue from 'vue';
import { RcRegistrationLandingPage } from '@crctech/component-library';
import routes from '@/constants/routes';
import { IEvent } from '@crctech/registration-lib/src/entities/event';

export default Vue.extend({
  name: 'LandingPage',

  components: {
    RcRegistrationLandingPage,
  },

  computed: {
    phoneNumber(): string {
      return this.event?.responseDetails?.assistanceNumber;
    },
    event(): IEvent {
      return this.$storage.registration.getters.event();
    },
  },

  methods: {
    redirect() {
      this.$router.push({ name: routes.individual.name });
    },
  },
});
</script>
