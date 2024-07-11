<template>
  <additional-members-lib :disable-autocomplete="!enableAutocomplete" :show-beneficiary-name="true" />
</template>

<script lang="ts">
import Vue from 'vue';
import AdditionalMembersLib from '@libs/registration-lib/components/additional-members/AdditionalMembersLib.vue';

export default Vue.extend({
  name: 'AdditionalMembers',

  components: {
    AdditionalMembersLib,
  },
  computed: {
    enableAutocomplete(): boolean {
      return this.$hasFeature(this.$featureKeys.AddressAutoFill);
    },
  },
});
</script>
