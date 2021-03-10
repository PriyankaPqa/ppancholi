<template>
  <v-row>
    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-model="form.firstName"
        :data-test="`${prefixDataTest}__firstName`"
        :rules="rules.firstName"
        :label="`${$t('registration.personal_info.firstName')}*`" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-model="form.middleName"
        :data-test="`${prefixDataTest}__middleName`"
        :rules="rules.middleName"
        :label="$t('registration.personal_info.middleName')" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-model="form.lastName"
        :rules="rules.lastName"
        :data-test="`${prefixDataTest}__lastName`"
        :label="`${$t('registration.personal_info.lastName')}*`" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-model="form.preferredName"
        :data-test="`${prefixDataTest}__preferredName`"
        :rules="rules.preferredName"
        :label="$t('registration.personal_info.preferredName')" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-select-with-validation
        v-model="form.gender"
        :data-test="`${prefixDataTest}__gender`"
        :items="gendersItems"
        :item-text="(item) => $m(item.name)"
        return-object
        :rules="rules.gender"
        :label="`${$t('registration.personal_info.gender')}*`" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-if="form.gender && form.gender.isOther"
        v-model="form.genderOther"
        :data-test="`${prefixDataTest}__genderOther`"
        :rules="rules.genderOther"
        :label="`${$t('registration.personal_info.gender.other')}`" />
    </v-col>

    <v-col cols="12" class="pb-0">
      <div class="rc-body16 fw-bold">
        {{ $t('registration.personal_info.birthdate') }}
      </div>
    </v-col>
    <v-col cols="12" sm="8">
      <v-row no-gutters>
        <v-col cols="6" class="pr-2">
          <v-select-with-validation
            v-model="form.birthDate.month"
            :data-test="`${prefixDataTest}__month`"
            :items="months"
            :item-text="(item) => $t(item.label)"
            item-value="number"
            :rules="rules.month"
            :label="`${$t('registration.personal_info.month')}*`" />
        </v-col>
        <v-col cols="3" class="pr-2">
          <v-text-field-with-validation
            v-model="form.birthDate.day"
            :data-test="`${prefixDataTest}__day`"
            type="number"
            min="1"
            max="31"
            :rules="rules.day"
            :label="`${$t('registration.personal_info.day')}*`" />
        </v-col>
        <v-col cols="3">
          <v-text-field-with-validation
            v-model="form.birthDate.year"
            :data-test="`${prefixDataTest}__year`"
            type="number"
            :rules="rules.year"
            :label="`${$t('registration.personal_info.year')}*`" />
        </v-col>
      </v-row>
    </v-col>

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
        :label="$t('registration.personal_info.primarySpokenLanguage')" />
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
      <ValidationProvider v-slot="{ errors }" :rules="rules.homePhone" :data-test="`${prefixDataTest}__homePhone`">
        <rc-phone v-model="form.homePhone" outlined :label="homePhoneLabel" :error-messages="errors" />
      </ValidationProvider>
    </v-col>

    <v-col cols="12" sm="6">
      <ValidationProvider v-slot="{ errors }" :rules="rules.mobilePhone" :data-test="`${prefixDataTest}__mobilePhone`">
        <rc-phone v-model="form.mobilePhone" outlined :label="$t('registration.personal_info.mobilePhoneNumber')" :error-messages="errors" />
      </ValidationProvider>
    </v-col>

    <v-col cols="12" sm="6">
      <ValidationProvider v-slot="{ errors }" :rules="rules.otherPhone" :data-test="`${prefixDataTest}__otherPhone`">
        <rc-phone v-model="form.otherPhone" outlined :label="$t('registration.personal_info.alternatePhoneNumber')" :error-messages="errors" />
      </ValidationProvider>
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

    <v-col cols="12" class="pb-0">
      <div class="rc-body16 fw-bold">
        {{ $t('registration.personal_info.indigenous_identity') }}
      </div>
    </v-col>
    <v-col cols="12" sm="6">
      <v-autocomplete-with-validation
        v-model="form.indigenousProvince"
        :data-test="`${prefixDataTest}__indigenousProvince`"
        :label="$t('registration.personal_info.indigenousProvince.label')"
        :items="canadianProvincesItems" />
    </v-col>
    <v-col cols="12" sm="6">
      <v-autocomplete-with-validation
        v-model="form.indigenousType"
        :label="$t('registration.personal_info.indigenousType.select.label')"
        :items="indigenousTypesItems"
        :rules="rules.indigenousType"
        :data-test="`${prefixDataTest}__indigenousType`" />
    </v-col>
    <v-col cols="12">
      <v-text-field-with-validation
        v-if="otherIndigenousType"
        v-model="form.indigenousCommunityOther"
        :rules="rules.indigenousCommunityOther"
        :data-test="`${prefixDataTest}__indigenousCommunityOther`"
        :label="$t('registration.personal_info.indigenousCommunityOther.label')" />
      <v-autocomplete-with-validation
        v-else
        v-model="form.indigenousCommunity"
        :label="$t('registration.personal_info.indigenousCommunity.label')"
        :items="[]"
        :rules="rules.indigenousCommunity"
        :item-text="(item) => $m(item.name)"
        return-object
        :data-test="`${prefixDataTest}__indigenousCommunity`" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  VSelectWithValidation, VTextFieldWithValidation, RcPhone, VAutocompleteWithValidation,
} from '@crctech/component-library';
import months from '@/constants/months';
import _cloneDeep from 'lodash/cloneDeep';
import {
  Beneficiary, IBirthDate, IOptionItemData, IPersonalInformation,
} from '@/entities/beneficiary';
import utils from '@/entities/utils';
import { MAX_LENGTH_MD, MAX_LENGTH_SM, MIN_AGE_REGISTRATION } from '@/constants/validations';
import { ECanadaProvinces } from '@/types';

export default Vue.extend({
  name: 'PersonalInformation',

  components: {
    VSelectWithValidation,
    VTextFieldWithValidation,
    RcPhone,
    VAutocompleteWithValidation,
  },
  props: {
    beneficiary: {
      type: Beneficiary,
      required: true,
    },
    prefixDataTest: {
      type: String,
      default: 'personalInfo',
    },
  },

  data() {
    return {
      months,
      form: null as IPersonalInformation,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        firstName: {
          required: true,
          max: MAX_LENGTH_SM,
        },
        middleName: {
          max: MAX_LENGTH_SM,
        },
        lastName: {
          required: true,
          max: MAX_LENGTH_SM,
        },
        preferredName: {
          max: MAX_LENGTH_SM,
        },
        gender: {
          required: true,
        },
        genderOther: {
          max: MAX_LENGTH_MD,
        },
        month: {
          required: true,
          birthday: { birthdate: this.computedBirthdate },
          minimumAge: { birthdate: this.computedBirthdate, age: MIN_AGE_REGISTRATION },
        },
        day: {
          required: true,
          birthday: { birthdate: this.computedBirthdate },
          minimumAge: { birthdate: this.computedBirthdate, age: MIN_AGE_REGISTRATION },
        },
        year: {
          required: true,
          birthday: { birthdate: this.computedBirthdate },
          minimumAge: { birthdate: this.computedBirthdate, age: MIN_AGE_REGISTRATION },
        },
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

    computedBirthdate(): IBirthDate {
      return {
        year: this.form.birthDate.year,
        month: this.form.birthDate.month,
        day: this.form.birthDate.day,
      };
    },

    hasHomePhoneAndEmail(): boolean {
      return !!(this.form.homePhone?.number || this.form.email);
    },

    gendersItems(): IOptionItemData[] {
      return this.$storage.registration.getters.genders();
    },

    preferredLanguagesItems(): IOptionItemData[] {
      return this.$storage.registration.getters.preferredLanguages();
    },

    primarySpokenLanguagesItems(): IOptionItemData[] {
      return this.$storage.registration.getters.primarySpokenLanguages();
    },

    indigenousTypesItems(): IOptionItemData[] {
      return this.$storage.registration.getters.indigenousTypes();
    },

    canadianProvincesItems(): Record<string, string>[] {
      return utils.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces');
    },

    otherIndigenousType(): boolean {
      // return this.form.indigenousType === EIndigenousTypes.Other;
      return true;
    },
  },

  watch: {
    form: {
      deep: true,
      handler(newValue: IPersonalInformation) {
        this.$emit('updateEntity', 'personalInformation', newValue);
      },
    },
  },

  created() {
    this.form = _cloneDeep(this.beneficiary.personalInformation);

    this.prepopulate();
  },

  methods: {
    onIndigenousTypeChange() {
      // todo
    },

    prepopulate() {
      if (!this.form.gender) {
        this.form.gender = this.findDefault(this.gendersItems);
      }
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
  },
});
</script>
