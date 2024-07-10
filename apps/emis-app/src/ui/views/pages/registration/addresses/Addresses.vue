<template>
  <addresses-lib :disable-autocomplete="!enableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import AddressesLib from '@libs/registration-lib/components/addresses/AddressesLib.vue';

export default Vue.extend({
  name: 'Addresses',
  components: {
    AddressesLib,
  },

  computed: {
    enableAutocomplete(): boolean {
      return this.$hasFeature(this.$featureKeys.AddressAutoFill);
    },
  },
});
</script>
