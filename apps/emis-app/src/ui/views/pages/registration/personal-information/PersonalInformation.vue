<template>
  <personal-information-lib :i18n="i18n" skip-phone-email-rules :prefill-personal-information="prefillPersonalInformation" :is-edit-mode="isEditMode" />
</template>

<script lang="ts">
import Vue from 'vue';
import PersonalInformationLib from '@libs/registration-lib/components/personal-information/PersonalInformationLib.vue';
import { i18n } from '@/ui/plugins';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

export default Vue.extend({
  name: 'PersonalInformation',

  components: {
    PersonalInformationLib,
  },

  props: {
    isEditMode: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      i18n,
    };
  },
  computed: {
    // TODO EMISV2-6226 remove feature flag
    prefillPersonalInformation(): boolean {
      return this.$hasFeature(FeatureKeys.PreFillPersonalInformation);
    },
  },
});
</script>
