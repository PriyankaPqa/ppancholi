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
        :label="`${$t('registration.personal_info.primarySpokenLanguage.pleaseSpecify')}*`" />
    </v-col>

    <v-col cols="12" sm="6">
      <rc-phone-with-validation
        v-model="formCopy.homePhoneNumber"
        :rules="rules.homePhoneNumber"
        outlined
        :label="homePhoneNumberLabel"
        :data-test="`${prefixDataTest}__homePhoneNumber`"
        @focusout="incrementFocusPhoneCounter()" />
    </v-col>

    <v-col cols="12" sm="6">
      <rc-phone-with-validation
        v-model="formCopy.mobilePhoneNumber"
        :rules="rules.mobilePhoneNumber"
        outlined
        :label="mobilePhoneNumberLabel"
        :data-test="`${prefixDataTest}__mobilePhoneNumber`"
        @focusout="incrementFocusPhoneCounter()" />
    </v-col>

    <v-col cols="12" sm="6">
      <rc-phone-with-validation
        v-model="formCopy.alternatePhoneNumber"
        :rules="rules.alternatePhoneNumber"
        outlined
        :label="alternatePhoneNumberLabel"
        :data-test="`${prefixDataTest}__alternatePhoneNumber`"
        @focusout="incrementFocusPhoneCounter()" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-model="formCopy.alternatePhoneNumber.extension"
        :data-test="`${prefixDataTest}__alternatePhoneNumberExtension`"
        :rules="rules.alternatePhoneNumberExtension"
        :label="$t('registration.personal_info.alternatePhoneNumberExtension')" />
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
      formCopy: null as IContactInformation,
      focusPhoneCounter: 0,
      triggerPhoneMessage: 3,
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
          required: this.formCopy.primarySpokenLanguage && this.formCopy.primarySpokenLanguage.isOther,
          max: MAX_LENGTH_MD,
        },
        homePhoneNumber: this.phoneRule,
        mobilePhoneNumber: this.phoneRule,
        alternatePhoneNumber: this.phoneRule,
        alternatePhoneNumberExtension: {
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

    homePhoneNumberLabel(): string {
      return `${this.$t('registration.personal_info.homePhoneNumber')}${this.phoneRequired ? '*' : ''}`;
    },

    mobilePhoneNumberLabel(): string {
      return `${this.$t('registration.personal_info.mobilePhoneNumber')}${this.phoneRequired ? '*' : ''}`;
    },

    alternatePhoneNumberLabel(): string {
      return `${this.$t('registration.personal_info.alternatePhoneNumber')}${this.phoneRequired ? '*' : ''}`;
    },

    hasAnyPhone(): boolean {
      return !!(this.formCopy.homePhoneNumber?.number || this.formCopy.mobilePhoneNumber?.number || this.formCopy.alternatePhoneNumber?.number);
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
        requiredPhone: (this.focusPhoneCounter >= this.triggerPhoneMessage) ? { isMissing: this.phoneRequired } : false,
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

    incrementFocusPhoneCounter() {
      this.focusPhoneCounter += 1;
    },
  },
});
</script>
