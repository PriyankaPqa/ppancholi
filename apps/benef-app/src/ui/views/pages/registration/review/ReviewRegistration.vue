<template>
  <review-registration-lib
    :i18n="i18n"
    :disable-autocomplete="disableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import ReviewRegistrationLib from '@libs/registration-lib/components/review/ReviewRegistrationLib.vue';
import { i18n } from '@/ui/plugins';

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

  data() {
    return {
      i18n,
    };
  },
});
</script>
