<template>
  <lib-addresses :i18n="i18n" :disable-autocomplete="!enableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import { Addresses as LibAddresses } from '@crctech/registration-lib';
import { i18n } from '@/ui/plugins';
import { FeatureKeys } from '@/entities/tenantSettings';

export default Vue.extend({
  name: 'Addresses',
  components: {
    LibAddresses,
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
