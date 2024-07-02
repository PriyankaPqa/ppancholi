<template>
  <addresses-lib :disable-autocomplete="disableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import AddressesLib from '@libs/registration-lib/components/addresses/AddressesLib.vue';

export default Vue.extend({
  name: 'Addresses',

  components: {
    AddressesLib,
  },

  props: {
    disableAutocomplete: {
      type: Boolean,
      required: true,
    },
  },
});
</script>
