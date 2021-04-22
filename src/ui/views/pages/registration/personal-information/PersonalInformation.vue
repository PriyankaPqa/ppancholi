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
import Vue from 'vue';
import {
  ECanadaProvinces,
  IOptionItemData,
} from '@/types';
import { IBeneficiary, IContactInformation, IPerson } from '@crctech/registration-lib/src/entities/beneficiary';
import { IndigenousIdentityForm, IdentityForm, ContactInformationForm } from '@crctech/registration-lib';

import { MIN_AGE_REGISTRATION } from '@/constants/validations';
import { enumToTranslatedCollection } from '@/ui/utils';
import { TranslateResult } from 'vue-i18n';

export default Vue.extend({
  name: 'PersonalInformation',

  components: {
    IndigenousIdentityForm,
    IdentityForm,
    ContactInformationForm,
  },

  props: {
    prefixDataTest: {
      type: String,
      default: 'personalInfo',
    },
  },

  data() {
    return {
      MIN_AGE_REGISTRATION,
    };
  },

  computed: {
    person(): IPerson {
      return this.beneficiary.person;
    },

    contactInformation(): IContactInformation {
      return this.beneficiary.contactInformation;
    },

    beneficiary(): IBeneficiary {
      return this.$storage.beneficiary.getters.beneficiary();
    },

    preferredLanguagesItems(): IOptionItemData[] {
      return this.$storage.registration.getters.preferredLanguages();
    },

    primarySpokenLanguagesItems(): IOptionItemData[] {
      return this.$storage.registration.getters.primarySpokenLanguages();
    },

    genderItems(): IOptionItemData[] {
      return this.$storage.registration.getters.genders();
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return enumToTranslatedCollection(ECanadaProvinces, 'common.provinces');
    },

    indigenousTypesItems(): Record<string, TranslateResult>[] {
      return this.$storage.registration.getters.indigenousTypesItems(this.person.indigenousProvince);
    },

    indigenousCommunitiesItems(): Record<string, string>[] {
      return this.$storage.registration.getters.indigenousCommunitiesItems(this.person.indigenousProvince, this.person.indigenousType);
    },

    loadingIndigenousIdentities(): boolean {
      return this.$store.state.registration.loadingIndigenousIdentities;
    },

  },

  methods: {
    async onIndigenousProvinceChange(provinceCode: ECanadaProvinces) {
      await this.$storage.registration.actions.fetchIndigenousIdentitiesByProvince(provinceCode);
    },

    setIdentity(form: IPerson) {
      this.$storage.beneficiary.mutations.setIdentity(form);
    },

    setIndigenousIdentity(form: IPerson) {
      this.$storage.beneficiary.mutations.setIndigenousIdentity(form);
    },

    setContactInformation(form: IContactInformation) {
      this.$storage.beneficiary.mutations.setContactInformation(form);
    },
  },
});
</script>
