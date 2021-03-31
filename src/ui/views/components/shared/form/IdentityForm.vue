<template>
  <v-row>
    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-model="formCopy.firstName"
        :data-test="`${prefixDataTest}__firstName`"
        :rules="rules.firstName"
        :label="`${$t('registration.personal_info.firstName')}*`" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-model="formCopy.middleName"
        :data-test="`${prefixDataTest}__middleName`"
        :rules="rules.middleName"
        :label="$t('registration.personal_info.middleName')" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-model="formCopy.lastName"
        :rules="rules.lastName"
        :data-test="`${prefixDataTest}__lastName`"
        :label="`${$t('registration.personal_info.lastName')}*`" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-model="formCopy.preferredName"
        :data-test="`${prefixDataTest}__preferredName`"
        :rules="rules.preferredName"
        :label="$t('registration.personal_info.preferredName')" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-select-with-validation
        v-model="formCopy.gender"
        :data-test="`${prefixDataTest}__gender`"
        :items="gendersItems"
        :item-text="(item) => $m(item.name)"
        return-object
        :rules="rules.gender"
        :label="`${$t('registration.personal_info.gender')}*`" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-if="formCopy.gender && formCopy.gender.isOther"
        v-model="formCopy.genderOther"
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
            v-model="formCopy.birthDate.month"
            :data-test="`${prefixDataTest}__month`"
            :items="months"
            :item-text="(item) => $t(item.label)"
            item-value="number"
            :rules="rules.month"
            :label="`${$t('registration.personal_info.month')}*`" />
        </v-col>
        <v-col cols="3" class="pr-2">
          <v-text-field-with-validation
            v-model="formCopy.birthDate.day"
            :data-test="`${prefixDataTest}__day`"
            type="number"
            min="1"
            max="31"
            :rules="rules.day"
            :label="`${$t('registration.personal_info.day')}*`" />
        </v-col>
        <v-col cols="3">
          <v-text-field-with-validation
            v-model="formCopy.birthDate.year"
            :data-test="`${prefixDataTest}__year`"
            type="number"
            :rules="rules.year"
            :label="`${$t('registration.personal_info.year')}*`" />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { MAX_LENGTH_MD, MAX_LENGTH_SM, MIN_AGE_REGISTRATION } from '@/constants/validations';
import { IBirthDate, IOptionItemData } from '@/entities/beneficiary';
import months from '@/constants/months';
import { VSelectWithValidation, VTextFieldWithValidation } from '@crctech/component-library';

export default Vue.extend({
  name: 'IdentityForm',

  components: {
    VSelectWithValidation,
    VTextFieldWithValidation,
  },

  props: {
    prefixDataTest: {
      type: String,
      default: 'personalInfo',
    },

    form: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      months,
      formCopy: {
        birthDate: { year: null, month: null, day: null },
        gender: {},
        preferredLanguage: {},
        primarySpokenLanguage: {},
        indigenousProvince: null,
        indigenousType: null,
        indigenousCommunityId: null,
        indigenousCommunityOther: null,
      },
    };
  },

  computed: {

    gendersItems(): IOptionItemData[] {
      return this.$storage.registration.getters.genders();
    },

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
      };
    },

    computedBirthdate(): IBirthDate {
      return {
        year: this.form.birthDate.year,
        month: this.form.birthDate.month,
        day: this.form.birthDate.day,
      };
    },
  },

  mounted() {
    this.formCopy = this.form;
    this.prePopulate();
  },

  methods: {
    prePopulate() {
      if (!this.formCopy.gender) {
        this.formCopy.gender = this.gendersItems.find((option: IOptionItemData) => option.isDefault);
      }
    },
  },
});
</script>
