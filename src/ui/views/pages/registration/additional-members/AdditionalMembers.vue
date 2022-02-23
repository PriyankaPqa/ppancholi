<template>
  <lib-additional-members :i18n="i18n" :disable-autocomplete="disableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';

import { AdditionalMembers as LibAdditionalMembers } from '@crctech/registration-lib';
import { i18n } from '@/ui/plugins';

export default Vue.extend({
  name: 'AdditionalMembers',

  components: {
    LibAdditionalMembers,
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
