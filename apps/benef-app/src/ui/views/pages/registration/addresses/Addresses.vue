<template>
  <addresses-lib :i18n="i18n" :disable-autocomplete="disableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import AddressesLib from '@libs/registration-lib/components/addresses/AddressesLib.vue';
import { i18n } from '@/ui/plugins';

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

  data() {
    return {
      i18n,
    };
  },
});
</script>
