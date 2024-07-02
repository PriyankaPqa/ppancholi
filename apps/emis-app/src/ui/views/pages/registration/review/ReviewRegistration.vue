<template>
  <review-registration-lib :user="user" :consent-statements="consentStatements" show-age-in-review skip-phone-email-rules :disable-autocomplete="!enableAutocomplete">
    <template #previous-events="slotProps">
      <previous-events-template :household-id="slotProps.householdId" />
    </template>
  </review-registration-lib>
</template>

<script lang="ts">
import Vue from 'vue';
import ReviewRegistrationLib from '@libs/registration-lib/components/review/ReviewRegistrationLib.vue';
import PreviousEventsTemplate from '@/ui/views/pages/registration/review/PreviousEventsTemplate.vue';
import { FeatureKeys, IConsentStatement } from '@libs/entities-lib/tenantSettings';
import { IUser } from '@libs/entities-lib/user';
import { useUserStore } from '@/pinia/user/user';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';

export default Vue.extend({
  name: 'ReviewRegistration',

  components: {
    PreviousEventsTemplate,
    ReviewRegistrationLib,
  },

  computed: {
    enableAutocomplete(): boolean {
      return this.$hasFeature(FeatureKeys.AddressAutoFill);
    },
    user(): IUser {
      return useUserStore().getUser();
    },
    consentStatements(): Array<IConsentStatement> {
      return useTenantSettingsStore().currentTenantSettings.consentStatements;
    },
  },

});
</script>
