<template>
  <personal-information-lib
    :min-age-registration="MIN_AGE_REGISTRATION"
    :i18n="i18n"
    prevent-db-duplicate-check
    :allow-duplicate-emails="$hasFeature(FeatureKeys.SelfRegistration)" />
</template>
<script lang="ts">
import Vue from 'vue';
import PersonalInformationLib from '@libs/registration-lib/components/personal-information/PersonalInformationLib.vue';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { MIN_AGE_REGISTRATION } from '@/constants/validations';
import { i18n } from '@/ui/plugins';

export default Vue.extend({
  name: 'PersonalInformation',
  components: {
    PersonalInformationLib,
  },

  data() {
    return {
      MIN_AGE_REGISTRATION,
      i18n,
      FeatureKeys,
    };
  },
});
</script>
