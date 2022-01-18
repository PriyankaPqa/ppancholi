<template>
  <lib-review-registration :i18n="i18n" show-age-in-review hide-name :disable-autocomplete="!enableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import { ReviewRegistration as LibReviewRegistration } from '@crctech/registration-lib';
import { FeatureKeys } from '@/entities/tenantSettings';

export default Vue.extend({
  name: 'ReviewSplit',

  components: {
    LibReviewRegistration,
  },

  data() {
    return {
      i18n: this.$i18n,
    };
  },

  computed: {
    enableAutocomplete(): boolean {
      return this.$hasFeature(FeatureKeys.AddressAutoFill);
    },
  },
});
</script>
