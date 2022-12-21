<template>
  <review-registration-lib :i18n="i18n" :user="user" show-age-in-review skip-phone-email-rules :disable-autocomplete="!enableAutocomplete">
    <template #previous-events="slotProps">
      <previous-events-template :household-id="slotProps.householdId" />
    </template>
  </review-registration-lib>
</template>

<script lang="ts">
import Vue from 'vue';
import ReviewRegistrationLib from '@libs/registration-lib/components/review/ReviewRegistrationLib.vue';
import { i18n } from '@/ui/plugins';
import PreviousEventsTemplate from '@/ui/views/pages/registration/review/PreviousEventsTemplate.vue';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { IUser } from '@libs/entities-lib/user';
import { useUserStore } from '@/pinia/user/user';

export default Vue.extend({
  name: 'ReviewRegistration',

  components: {
    PreviousEventsTemplate,
    ReviewRegistrationLib,
  },

  data() {
    return {
      i18n,
    };
  },

  computed: {
    enableAutocomplete(): boolean {
      return this.$hasFeature(FeatureKeys.AddressAutoFill);
    },
    user(): IUser {
      return useUserStore().getUser();
    },
  },

});
</script>
