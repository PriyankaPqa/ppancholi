<template>
  <lib-personal-information :min-age-registration="MIN_AGE_REGISTRATION" />
</template>

<script lang="ts">
import Vue from 'vue';
import { PersonalInformation as LibPersonalInformation } from '@crctech/registration-lib';
import { MIN_AGE_REGISTRATION } from '@/constants/validations';

export default Vue.extend({
  name: 'PersonalInformation',

  components: {
    LibPersonalInformation,
  },

  data() {
    return {
      MIN_AGE_REGISTRATION,
    };
  },
});
</script>
