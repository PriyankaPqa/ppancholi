<template>
  <review-registration-lib :i18n="i18n" show-age-in-review hide-name :disable-autocomplete="!enableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import ReviewRegistrationLib from '@libs/registration-lib/components/review/ReviewRegistrationLib.vue';

import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

export default Vue.extend({
  name: 'ReviewSplit',

  components: {
    ReviewRegistrationLib,
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
