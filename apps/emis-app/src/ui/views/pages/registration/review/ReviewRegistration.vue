<template>
  <lib-review-registration :i18n="i18n" show-age-in-review skip-phone-email-rules :disable-autocomplete="!enableAutocomplete">
    <template #previous-events="slotProps">
      <previous-events-template :household-id="slotProps.householdId" />
    </template>
  </lib-review-registration>
</template>

<script lang="ts">
import Vue from 'vue';
import LibReviewRegistration from '@libs/registration-lib/components/review/ReviewRegistration.vue';
import { i18n } from '@/ui/plugins';
import PreviousEventsTemplate from '@/ui/views/pages/registration/review/PreviousEventsTemplate.vue';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

export default Vue.extend({
  name: 'ReviewRegistration',

  components: {
    PreviousEventsTemplate,
    LibReviewRegistration,
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
  },

});
</script>
