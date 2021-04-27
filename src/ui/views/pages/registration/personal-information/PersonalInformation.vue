<template>
  <v-row no-gutters>
    <identity-form
      :form="person"
      :gender-items="genderItems"
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

import mixins from 'vue-typed-mixins';
import personalInformation from '@crctech/registration-lib/src/ui/mixins/personalInformation';
import helpers from '@/ui/helpers';
import { ECanadaProvinces } from '@/types';

export default mixins(personalInformation).extend({
  name: 'PersonalInformation',

  components: {
    IndigenousIdentityForm,
    IdentityForm,
    ContactInformationForm,
  },

  mixins: [personalInformation],

  computed: {
    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces');
    },
  },
});
</script>
