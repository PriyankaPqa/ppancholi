<template>
  <lib-additional-members :i18n="i18n" :disable-autocomplete="!enableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';

import { AdditionalMembers as LibAdditionalMembers } from '@crctech/registration-lib';
import { i18n } from '@/ui/plugins';
import { FeatureKeys } from '@/entities/tenantSettings';

export default Vue.extend({
  name: 'AdditionalMembers',

  components: {
    LibAdditionalMembers,
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
