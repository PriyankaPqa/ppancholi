<template>
  <lib-personal-information :i18n="i18n" skip-phone-email-rules />
</template>

<script lang="ts">
import Vue from 'vue';
import LibPersonalInformation from '@libs/registration-lib/components/personal-information/PersonalInformation.vue';
import { i18n } from '@/ui/plugins';

export default Vue.extend({
  name: 'PersonalInformation',

  components: {
    LibPersonalInformation,
  },

  data() {
    return {
      i18n,
    };
  },
});
</script>
