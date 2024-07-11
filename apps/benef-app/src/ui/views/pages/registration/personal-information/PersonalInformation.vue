<template>
  <personal-information-lib
    :min-age-registration="MIN_AGE_REGISTRATION"
    prevent-db-duplicate-check
    :allow-duplicate-emails="$hasFeature($featureKeys.SelfRegistration)" />
</template>
<script lang="ts">
import Vue from 'vue';
import PersonalInformationLib from '@libs/registration-lib/components/personal-information/PersonalInformationLib.vue';

import { MIN_AGE_REGISTRATION } from '@/constants/validations';

export default Vue.extend({
  name: 'PersonalInformation',
  components: {
    PersonalInformationLib,
  },

  data() {
    return {
      MIN_AGE_REGISTRATION,
    };
  },
});
</script>
