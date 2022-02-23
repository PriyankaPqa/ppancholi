<template>
  <div>
    <h1 class="d-flex justify-center pt-6">
      {{ $m(event.name) }}
    </h1>
    <rc-registration-landing-page
      :title="$t('registration.landingpage.welcome_self')"
      :phone-number="phoneNumber"
      @redirect="redirect" />
  </div>
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

  created() {
    document.title = this.$m(this.event.name) as string;
  },

  methods: {
    redirect() {
      this.$router.push({ name: routes.individual.name });
    },
  },
});
</script>
