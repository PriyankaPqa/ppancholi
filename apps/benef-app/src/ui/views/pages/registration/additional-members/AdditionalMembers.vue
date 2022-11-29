<template>
  <additional-members-lib :i18n="i18n" :disable-autocomplete="disableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import AdditionalMembersLib from '@libs/registration-lib/components/additional-members/AdditionalMembersLib.vue';
import { i18n } from '@/ui/plugins';

export default Vue.extend({
  name: 'AdditionalMembers',

  components: {
    AdditionalMembersLib,
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
