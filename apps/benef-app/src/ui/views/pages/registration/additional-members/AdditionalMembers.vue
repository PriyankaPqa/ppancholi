<template>
  <additional-members-lib :disable-autocomplete="disableAutocomplete" />
</template>

<script lang="ts">
import Vue from 'vue';
import AdditionalMembersLib from '@libs/registration-lib/components/additional-members/AdditionalMembersLib.vue';

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
});
</script>
