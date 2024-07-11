<template>
  <review-registration-lib
    :disable-autocomplete="disableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import ReviewRegistrationLib from '@libs/registration-lib/components/review/ReviewRegistrationLib.vue';

export default Vue.extend({
  name: 'ReviewRegistration',

  components: {
    ReviewRegistrationLib,
  },

  props: {
    disableAutocomplete: {
      type: Boolean,
      required: true,
    },
  },
});
</script>
