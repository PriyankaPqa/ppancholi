<template>
  <v-row no-gutters>
    <identity-form
      :form="person"
      :gender-items="genderItems"
      :min-age-restriction="MIN_AGE_REGISTRATION"
      @change="setIdentity($event)" />

    <contact-information-form
      :form="contactInformation"
      :preferred-languages-items="preferredLanguagesItems"
      :primary-spoken-languages-items="primarySpokenLanguagesItems"
      @change="setContactInformation($event)" />

    <indigenous-identity-form
      :form="person"
      :canadian-provinces-items="canadianProvincesItems"
      :indigenous-communities-items="indigenousCommunitiesItems"
      :indigenous-types-items="indigenousTypesItems"
      :loading="loadingIndigenousIdentities"
      @change="setIndigenousIdentity($event)"
      @province-change="onIndigenousProvinceChange($event)" />
  </v-row>
</template>

<script lang="ts">

import { IndigenousIdentityForm, IdentityForm, ContactInformationForm } from '@crctech/registration-lib';
import { MIN_AGE_REGISTRATION } from '@/constants/validations';

import mixins from 'vue-typed-mixins';
import personalInformation from '@crctech/registration-lib/src/ui/mixins/personalInformation';
import { ECanadaProvinces } from '@/types';
import { enumToTranslatedCollection } from '@/ui/utils';

export default mixins(personalInformation).extend({
  name: 'PersonalInformation',

  components: {
    IndigenousIdentityForm,
    IdentityForm,
    ContactInformationForm,
  },

  mixins: [personalInformation],

  data() {
    return {
      MIN_AGE_REGISTRATION,
    };
  },

  computed: {
    canadianProvincesItems(): Record<string, unknown>[] {
      return enumToTranslatedCollection(ECanadaProvinces, 'common.provinces');
    },
  },
});
</script>
