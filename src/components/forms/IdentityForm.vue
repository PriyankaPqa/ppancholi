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
        :items="genderItems"
        :item-text="(item) => $m(item.name)"
        return-object
        :rules="rules.gender"
        :label="`${$t('registration.personal_info.gender')}*`"
        @change="genderChange($event)" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-if="formCopy.gender && formCopy.gender.isOther"
        v-model="formCopy.genderOther"
        :data-test="`${prefixDataTest}__genderOther`"
        :rules="rules.genderOther"
        :label="`${$t('registration.personal_info.gender.other')}*`" />
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
import _cloneDeep from 'lodash/cloneDeep';
import { VTextFieldWithValidation, VSelectWithValidation } from '@crctech/component-library';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../constants/validations';
import { IBirthDate, IPerson } from '../../entities/beneficiary';
import { IOptionItemData } from '../../types';
import months from '../../constants/months';

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
      type: Object as () => IPerson,
      required: true,
    },

    minAgeRestriction: {
      type: Number,
      default: null,
    },

    genderItems: {
      type: Array as () => IOptionItemData[],
      required: true,
    },

  },

  data() {
    return {
      months,
      formCopy: null as IPerson,
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
          required: true,
        },
        month: this.birthDateRule,
        day: this.birthDateRule,
        year: this.birthDateRule,
      };
    },

    birthDateRule(): Record<string, unknown> {
      if (this.minAgeRestriction) {
        return {
          required: true,
          birthday: { birthdate: this.computedBirthdate },
          minimumAge: { birthdate: this.computedBirthdate, age: this.minAgeRestriction },
        };
      }
      return {
        required: true,
        birthday: { birthdate: this.computedBirthdate },
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

  watch: {
    formCopy: {
      deep: true,
      handler(form: IPerson) {
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
      if (!this.formCopy.gender) {
        this.formCopy.gender = this.genderItems.find((option: IOptionItemData) => option.isDefault);
      }
    },

    genderChange(gender: IOptionItemData) {
      if (!gender.isOther) {
        this.formCopy.genderOther = '';
      }
    },
  },
});
</script>
