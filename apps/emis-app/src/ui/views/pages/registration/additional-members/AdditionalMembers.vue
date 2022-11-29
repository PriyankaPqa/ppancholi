<template>
  <additional-members-lib :i18n="i18n" :disable-autocomplete="!enableAutocomplete" :show-beneficiary-name="true" />
</template>

<script lang="ts">
import Vue from 'vue';
import AdditionalMembersLib from '@libs/registration-lib/components/additional-members/AdditionalMembersLib.vue';
import { i18n } from '@/ui/plugins';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

export default Vue.extend({
  name: 'AdditionalMembers',

  components: {
    AdditionalMembersLib,
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
