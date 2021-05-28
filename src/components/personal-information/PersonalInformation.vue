<template>
  <v-row no-gutters>
    <identity-form
      :form="identitySet"
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
      :form="identitySet"
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
import { IHouseholdCreate, IIdentitySet } from '../../entities/household-create';
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
    identitySet(): IIdentitySet {
      return this.householdCreate.primaryBeneficiary.identitySet;
    },

    contactInformation(): IContactInformation {
      return this.householdCreate.primaryBeneficiary.contactInformation;
    },

    householdCreate(): IHouseholdCreate {
      return this.$storage.household.getters.householdCreate();
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
      return this.$storage.registration.getters.indigenousTypesItems(this.identitySet.indigenousProvince);
    },

    indigenousCommunitiesItems(): Record<string, string>[] {
      return this.$storage.registration.getters.indigenousCommunitiesItems(this.identitySet.indigenousProvince, this.identitySet.indigenousType);
    },

    loadingIndigenousIdentities(): boolean {
      return this.$store.state.registration.loadingIndigenousIdentities;
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.getCanadianProvincesWithoutOther(this.i18n);
    },

  },

  methods: {
    async onIndigenousProvinceChange(provinceCode: ECanadaProvinces) {
      await this.$storage.registration.actions.fetchIndigenousIdentitiesByProvince(provinceCode);
    },

    setIdentity(form: IIdentitySet) {
      this.$storage.household.mutations.setIdentity(form);
    },

    setIndigenousIdentity(form: IIdentitySet) {
      this.$storage.household.mutations.setIndigenousIdentity(form);
    },

    setContactInformation(form: IContactInformation) {
      this.$storage.household.mutations.setContactInformation(form);
    },
  },
});
</script>
