<template>
  <v-row>
    <v-col cols="12" sm="6">
      <v-select-with-validation
        v-model="formCopy.preferredLanguage"
        :data-test="`${prefixDataTest}__preferredLanguage`"
        :items="preferredLanguagesItems"
        :rules="rules.preferredLanguage"
        :item-text="(item) => $m(item.name)"
        return-object
        :label="`${$t('registration.personal_info.preferredLanguage')}*`" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-if="formCopy.preferredLanguage && formCopy.preferredLanguage.isOther"
        v-model="formCopy.preferredLanguageOther"
        :data-test="`${prefixDataTest}__preferredLanguageOther`"
        :rules="rules.preferredLanguageOther"
        :label="`${$t('registration.personal_info.preferredLanguage.other')}`" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-select-with-validation
        v-model="formCopy.primarySpokenLanguage"
        :data-test="`${prefixDataTest}__primarySpokenLanguage`"
        :items="primarySpokenLanguagesItems"
        :rules="rules.primarySpokenLanguage"
        :item-text="(item) => $m(item.name)"
        return-object
        :label="$t('registration.personal_info.primarySpokenLanguage')" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-if="formCopy.primarySpokenLanguage && formCopy.primarySpokenLanguage.isOther"
        v-model="formCopy.primarySpokenLanguageOther"
        :data-test="`${prefixDataTest}__primarySpokenLanguageOther`"
        :rules="rules.primarySpokenLanguageOther"
        :label="`${$t('registration.personal_info.primarySpokenLanguage.pleaseSpecify')}`" />
    </v-col>

    <v-col cols="12" sm="6">
      <rc-phone-with-validation
        v-model="formCopy.homePhone"
        :rules="rules.homePhone"
        outlined
        :label="homePhoneLabel"
        :data-test="`${prefixDataTest}__homePhone`" />
    </v-col>

    <v-col cols="12" sm="6">
      <rc-phone-with-validation
        v-model="formCopy.mobilePhone"
        :rules="rules.mobilePhone"
        outlined
        :label="mobilePhoneLabel"
        :data-test="`${prefixDataTest}__mobilePhone`" />
    </v-col>

    <v-col cols="12" sm="6">
      <rc-phone-with-validation
        v-model="formCopy.otherPhone"
        :rules="rules.otherPhone"
        outlined
        :label="otherPhoneLabel"
        :data-test="`${prefixDataTest}__otherPhone`" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-model="formCopy.otherPhoneExtension"
        :data-test="`${prefixDataTest}__otherPhoneExtension`"
        :rules="rules.otherPhoneExtension"
        :label="$t('registration.personal_info.otherPhoneExtension')" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation v-model="formCopy.email" :data-test="`${prefixDataTest}__email`" :rules="rules.email" :label="emailLabel" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { VTextFieldWithValidation, VSelectWithValidation, RcPhoneWithValidation } from '@crctech/component-library';
import { IOptionItemData } from '../../types';
import { MAX_LENGTH_MD } from '../../constants/validations';
import { IContactInformation } from '../../entities/value-objects/contact-information';

export default Vue.extend({
  name: 'ContactInformationForm',

  components: {
    VTextFieldWithValidation,
    VSelectWithValidation,
    RcPhoneWithValidation,
  },

  props: {
    form: {
      type: Object as () => IContactInformation,
      required: true,
    },

    prefixDataTest: {
      type: String,
      default: 'personalInfo',
    },

    preferredLanguagesItems: {
      type: Array as () => IOptionItemData[],
      required: true,
    },

    primarySpokenLanguagesItems: {
      type: Array as () => IOptionItemData[],
      required: true,
    },

    skipPhoneEmailRules: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      formCopy: null,
    };
  },

  computed: {
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
        homePhone: this.phoneRule,
        mobilePhone: this.phoneRule,
        otherPhone: this.phoneRule,
        otherPhoneExtension: {
          max: MAX_LENGTH_MD,
        },
        email: {
          required: this.emailRequired,
          email: true,
          max: MAX_LENGTH_MD,
        },
      };
    },

    emailLabel(): string {
      return `${this.$t('registration.personal_info.emailAddress')}${this.emailRequired ? '*' : ''}`;
    },

    homePhoneLabel(): string {
      return `${this.$t('registration.personal_info.homePhoneNumber')}${this.phoneRequired ? '*' : ''}`;
    },

    mobilePhoneLabel(): string {
      return `${this.$t('registration.personal_info.mobilePhoneNumber')}${this.phoneRequired ? '*' : ''}`;
    },

    otherPhoneLabel(): string {
      return `${this.$t('registration.personal_info.alternatePhoneNumber')}${this.phoneRequired ? '*' : ''}`;
    },

    hasAnyPhone(): boolean {
      return !!(this.formCopy.homePhone?.number || this.formCopy.mobilePhone?.number || this.formCopy.otherPhone?.number);
    },

    phoneRequired(): boolean {
      if (this.skipPhoneEmailRules) {
        return false;
      }
      return (!this.hasAnyPhone && !this.formCopy.email);
    },

    emailRequired(): boolean {
      if (this.skipPhoneEmailRules) {
        return false;
      }
      return !this.hasAnyPhone;
    },

    phoneRule(): Record<string, unknown> {
      if (this.skipPhoneEmailRules) {
        return {
          phone: true,
        };
      }
      return {
        requiredPhone: { isMissing: this.phoneRequired },
        phone: true,
      };
    },
  },

  watch: {
    formCopy: {
      deep: true,
      handler(form: IContactInformation) {
        this.$emit('change', form);
      },
    },
  },

  created() {
    this.formCopy = _cloneDeep(this.form);
    this.prePopulate();
  },

  methods: {
    prePopulate() {
      if (!this.formCopy.preferredLanguage) {
        this.formCopy.preferredLanguage = this.findDefault(this.preferredLanguagesItems);
      }
      if (!this.formCopy.primarySpokenLanguage) {
        this.formCopy.primarySpokenLanguage = this.findDefault(this.primarySpokenLanguagesItems);
      }
    },

    findDefault(source: IOptionItemData[]): IOptionItemData {
      return source?.find((option) => option.isDefault);
    },
  },
});
</script>
