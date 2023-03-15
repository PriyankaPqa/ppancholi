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
import { IEvent } from '@libs/entities-lib/registration-event';
import routes from '@/constants/routes';
import { sessionStorageKeys } from '@/constants/sessionStorage';
import { useRegistrationStore } from '@/pinia/registration/registration';

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
    event(): IEvent {
      return useRegistrationStore().getEvent();
    },
  },

  created() {
    this.appVersion = sessionStorage.getItem(sessionStorageKeys.appVersion.name);
    useRegistrationStore().resetHouseholdCreate();
    useRegistrationStore().resetTabs();
    this.$services.publicApi.resetPublicToken();
    document.title = this.$m(this.event.name) as string;
  },

  methods: {
    redirect() {
      this.$router.push({ name: routes.individual.name });
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
