<template>
  <review-registration-lib show-age-in-review hide-name :disable-autocomplete="!enableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import ReviewRegistrationLib from '@libs/registration-lib/components/review/ReviewRegistrationLib.vue';

export default Vue.extend({
  name: 'ReviewSplit',

  components: {
    ReviewRegistrationLib,
  },

  computed: {
    enableAutocomplete(): boolean {
      return this.$hasFeature(this.$featureKeys.AddressAutoFill);
    },
  },
});
</script>
