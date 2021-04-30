<template>
  <lib-personal-information skip-phone-email-rules />
</template>

<script lang="ts">
import Vue from 'vue';
import { PersonalInformation as LibPersonalInformation } from '@crctech/registration-lib';

export default Vue.extend({
  name: 'PersonalInformation',

  components: {
    LibPersonalInformation,
  },
});
</script>
