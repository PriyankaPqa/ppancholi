<template>
  <personal-information-lib :i18n="i18n" skip-phone-email-rules />
</template>

<script lang="ts">
import Vue from 'vue';
import PersonalInformationLib from '@libs/registration-lib/components/personal-information/PersonalInformationLib.vue';
import { i18n } from '@/ui/plugins';

export default Vue.extend({
  name: 'PersonalInformation',

  components: {
    PersonalInformationLib,
  },

  data() {
    return {
      i18n,
    };
  },
});
</script>
