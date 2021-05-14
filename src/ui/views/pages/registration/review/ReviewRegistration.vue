<template>
  <lib-review-registration :i18n="i18n" />
</template>

<script lang="ts">
import Vue from 'vue';
import { ReviewRegistration as LibReviewRegistration } from '@crctech/registration-lib';
import { i18n } from '@/ui/plugins';

export default Vue.extend({
  name: 'ReviewRegistration',

  components: {
    LibReviewRegistration,
  },

  data() {
    return {
      i18n,
    };
  },
});
</script>
