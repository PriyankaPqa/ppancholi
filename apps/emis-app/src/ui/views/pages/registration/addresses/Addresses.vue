<template>
  <lib-addresses :i18n="i18n" :disable-autocomplete="!enableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import LibAddresses from '@libs/registration-lib/components/addresses/Addresses.vue';
import { i18n } from '@/ui/plugins';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

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
