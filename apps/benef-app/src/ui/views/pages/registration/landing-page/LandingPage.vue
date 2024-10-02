<template>
  <div class="landingPage">
    <div>
      <h1 class="d-flex justify-center pt-6">
        {{ $m(event.name) }}
      </h1>
      <rc-registration-landing-page
        :title="$t('registration.landingpage.welcome_self')"
        :phone-number="phoneNumber"
        @redirect="redirect" />
    </div>
    <div class="d-flex rc-body12 justify-end">
      {{ $t('registration.version') }}: {{ appVersion }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcRegistrationLandingPage } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import { sessionStorageKeys } from '@/constants/sessionStorage';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { RegistrationEvent } from '@libs/entities-lib/registration-event';

export default Vue.extend({
  name: 'LandingPage',

  components: {
    RcRegistrationLandingPage,
  },

  data() {
    return {
      appVersion: '',
    };
  },

  computed: {
    phoneNumber(): string {
      return this.event?.responseDetails?.assistanceNumber;
    },
    event(): RegistrationEvent {
      return useRegistrationStore().getEvent();
    },
  },

  created() {
    this.appVersion = sessionStorage.getItem(sessionStorageKeys.appVersion.name);
    document.title = this.$m(this.event.name) as string;
    this.reset();
  },

  methods: {
    reset() {
      useRegistrationStore().resetHouseholdCreate();
      useRegistrationStore().resetTabs();
      this.$registrationStore.isPrivacyAgreed = false;
      this.$services.publicApi.resetPublicToken();
    },
    redirect() {
      useRegistrationStore().setTimeOnStep('LandingPage');
      this.$router.replace({ name: routes.individual.name });
    },
  },
});
</script>

<style scoped lang="scss">
  .landingPage {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
</style>
