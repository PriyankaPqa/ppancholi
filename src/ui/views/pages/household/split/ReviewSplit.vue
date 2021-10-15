<template>
  <lib-review-registration :i18n="i18n" show-age-in-review hide-name />
</template>

<script lang="ts">
import Vue from 'vue';
import { ReviewRegistration as LibReviewRegistration } from '@crctech/registration-lib';

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

});
</script>
