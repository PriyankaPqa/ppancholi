<template>
  <v-row no-gutters>
    <identity-form
      :form="person"
      :gender-items="genderItems"
      :min-age-restriction="minAgeRegistration"
      @change="setIdentity($event)" />

    <contact-information-form
      :form="contactInformation"
      :preferred-languages-items="preferredLanguagesItems"
      :primary-spoken-languages-items="primarySpokenLanguagesItems"
      :skip-phone-email-rules="skipPhoneEmailRules"
      @change="setContactInformation($event)" />

    <indigenous-identity-form
      :form="person"
      :canadian-provinces-items="canadianProvincesItems"
      :i18n="i18n"
      :indigenous-communities-items="indigenousCommunitiesItems"
      :indigenous-types-items="indigenousTypesItems"
      :loading="loadingIndigenousIdentities"
      @change="setIndigenousIdentity($event)"
      @province-change="onIndigenousProvinceChange($event)" />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import VueI18n, { TranslateResult } from 'vue-i18n';
import helpers from '../../ui/helpers';
import { ECanadaProvinces, IOptionItemData } from '../../types';
import { IContactInformation } from '../../entities/value-objects/contact-information';
import { IBeneficiary } from '../../entities/beneficiary';
import { IPerson } from '../../entities/value-objects/person';
import ContactInformationForm from '../forms/ContactInformationForm.vue';
import IndigenousIdentityForm from '../forms/IndigenousIdentityForm.vue';
import IdentityForm from '../forms/IdentityForm.vue';

export default Vue.extend({
  name: 'PersonalInformation',

  components: {
    IndigenousIdentityForm,
    IdentityForm,
    ContactInformationForm,
  },

  props: {
    minAgeRegistration: {
      type: Number,
      default: null,
    },
    skipPhoneEmailRules: {
      type: Boolean,
      default: false,
    },
    i18n: {
      type: Object as () => VueI18n,
      required: true,
    },
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

    indigenousTypesItems(): Record<string, TranslateResult>[] {
      return this.$storage.registration.getters.indigenousTypesItems(this.person.indigenousProvince);
    },

    indigenousCommunitiesItems(): Record<string, string>[] {
      return this.$storage.registration.getters.indigenousCommunitiesItems(this.person.indigenousProvince, this.person.indigenousType);
    },

    loadingIndigenousIdentities(): boolean {
      return this.$store.state.registration.loadingIndigenousIdentities;
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces', this.i18n);
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
