<template>
  <v-row no-gutters>
    <identity-form :form="form" :min-age-restriction="MIN_AGE_REGISTRATION" />

    <v-row>
      <v-col cols="12" sm="6">
        <v-select-with-validation
          v-model="form.preferredLanguage"
          :data-test="`${prefixDataTest}__preferredLanguage`"
          :items="preferredLanguagesItems"
          :rules="rules.preferredLanguage"
          :item-text="(item) => $m(item.name)"
          return-object
          :label="`${$t('registration.personal_info.preferredLanguage')}*`" />
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field-with-validation
          v-if="form.preferredLanguage && form.preferredLanguage.isOther"
          v-model="form.preferredLanguageOther"
          :data-test="`${prefixDataTest}__preferredLanguageOther`"
          :rules="rules.preferredLanguageOther"
          :label="`${$t('registration.personal_info.preferredLanguage.other')}`" />
      </v-col>

      <v-col cols="12" sm="6">
        <v-select-with-validation
          v-model="form.primarySpokenLanguage"
          :data-test="`${prefixDataTest}__primarySpokenLanguage`"
          :items="primarySpokenLanguagesItems"
          :rules="rules.primarySpokenLanguage"
          :item-text="(item) => $m(item.name)"
          return-object
          :label="$t('registration.personal_info.primarySpokenLanguage')"
          @change="primarySpokenLanguageChange($event)" />
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field-with-validation
          v-if="form.primarySpokenLanguage && form.primarySpokenLanguage.isOther"
          v-model="form.primarySpokenLanguageOther"
          :data-test="`${prefixDataTest}__primarySpokenLanguageOther`"
          :rules="rules.primarySpokenLanguageOther"
          :label="`${$t('registration.personal_info.primarySpokenLanguage.pleaseSpecify')}`" />
      </v-col>

      <v-col cols="12" sm="6">
        <rc-phone-with-validation
          v-model="form.homePhone"
          :rules="rules.homePhone"
          outlined
          :label="homePhoneLabel"
          :data-test="`${prefixDataTest}__homePhone`" />
      </v-col>

      <v-col cols="12" sm="6">
        <rc-phone-with-validation
          v-model="form.mobilePhone"
          :rules="rules.mobilePhone"
          outlined
          :label="$t('registration.personal_info.mobilePhoneNumber')"
          :data-test="`${prefixDataTest}__mobilePhone`" />
      </v-col>

      <v-col cols="12" sm="6">
        <rc-phone-with-validation
          v-model="form.otherPhone"
          :rules="rules.otherPhone"
          outlined
          :label="$t('registration.personal_info.alternatePhoneNumber')"
          :data-test="`${prefixDataTest}__otherPhone`" />
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field-with-validation
          v-model="form.otherPhoneExtension"
          :data-test="`${prefixDataTest}__otherPhoneExtension`"
          :rules="rules.otherPhoneExtension"
          :label="$t('registration.personal_info.otherPhoneExtension')" />
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field-with-validation v-model="form.email" :data-test="`${prefixDataTest}__email`" :rules="rules.email" :label="emailLabel" />
      </v-col>
    </v-row>

    <indigenous-identity-form :form="form" />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  VSelectWithValidation, VTextFieldWithValidation, RcPhoneWithValidation,
} from '@crctech/component-library';
import {
  IOptionItemData,
} from '@/types';
import { IContactInformation, IPerson } from '@/entities/beneficiary';

import IndigenousIdentityForm from '@/ui/views/components/shared/form/IndigenousIdentityForm.vue';
import IdentityForm from '@/ui/views/components/shared/form/IdentityForm.vue';

import { MAX_LENGTH_MD, MIN_AGE_REGISTRATION } from '@/constants/validations';

export default Vue.extend({
  name: 'PersonalInformation',

  components: {
    VSelectWithValidation,
    VTextFieldWithValidation,
    RcPhoneWithValidation,
    IndigenousIdentityForm,
    IdentityForm,
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
      form: null,
    };
  },

  computed: {
    personalInformation(): IContactInformation & IPerson {
      return this.$storage.beneficiary.getters.personalInformation();
    },

    rules(): Record<string, unknown> {
      return {

        preferredLanguage: {
          required: true,
        },
        preferredLanguageOther: {
          max: MAX_LENGTH_MD,
        },
        primarySpokenLanguageOther: {
          max: MAX_LENGTH_MD,
        },
        homePhone: {
          hasPhoneOrEmail: { hasPhoneOrEmail: this.hasHomePhoneAndEmail },
          phone: true,
        },
        mobilePhone: {
          phone: true,
        },
        otherPhone: {
          phone: true,
        },
        otherPhoneExtension: {
          max: MAX_LENGTH_MD,
        },
        email: {
          hasPhoneOrEmail: { hasPhoneOrEmail: this.hasHomePhoneAndEmail },
          email: true,
          max: MAX_LENGTH_MD,
        },
      };
    },

    emailLabel(): string {
      return `${this.$t('registration.personal_info.emailAddress')}${this.form.homePhone?.number ? '' : '*'}`;
    },

    homePhoneLabel(): string {
      return `${this.$t('registration.personal_info.homePhoneNumber')}${this.form.email ? '' : '*'}`;
    },

    hasHomePhoneAndEmail(): boolean {
      return !!(this.form.homePhone?.number || this.form.email);
    },

    preferredLanguagesItems(): IOptionItemData[] {
      return this.$storage.registration.getters.preferredLanguages();
    },

    primarySpokenLanguagesItems(): IOptionItemData[] {
      return this.$storage.registration.getters.primarySpokenLanguages();
    },
  },

  watch: {
    form: {
      deep: true,
      handler(form: IContactInformation & IPerson) {
        this.$storage.beneficiary.mutations.setPersonalInformation(form);
      },
    },
  },

  created() {
    this.form = this.personalInformation;

    this.prePopulate();
  },

  methods: {
    prePopulate() {
      if (!this.form.preferredLanguage) {
        this.form.preferredLanguage = this.findDefault(this.preferredLanguagesItems);
      }
      if (!this.form.primarySpokenLanguage) {
        this.form.primarySpokenLanguage = this.findDefault(this.primarySpokenLanguagesItems);
      }
    },

    findDefault(source: IOptionItemData[]): IOptionItemData {
      return source?.find((option) => option.isDefault);
    },

    primarySpokenLanguageChange(lang: IOptionItemData) {
      if (!lang.isOther) {
        this.form.primarySpokenLanguageOther = '';
      }
    },
  },
});
</script>
