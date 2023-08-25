<template>
  <v-row>
    <v-col v-if="$hasFeature(FeatureKeys.ManageDuplicates) && form.getMemberDuplicateStatus() === MemberDuplicateStatus.Duplicate" cols="12" sm="12" class="failed">
      <message-box
        icon="mdi-alert"
        data-test="personal_info_duplicate_error"
        :message="duplicateMessage" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-model="formCopy.firstName"
        :data-test="`${prefixDataTest}__firstName`"
        :rules="rules.firstName"
        :label="`${$t('registration.personal_info.firstName')}*`"
        @input="capitalize('firstName')" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-model="formCopy.middleName"
        :data-test="`${prefixDataTest}__middleName`"
        :rules="rules.middleName"
        :label="$t('registration.personal_info.middleName')"
        @input="capitalize('middleName')" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-model="formCopy.lastName"
        :rules="rules.lastName"
        :data-test="`${prefixDataTest}__lastName`"
        :label="`${$t('registration.personal_info.lastName')}*`"
        @input="capitalize('lastName')" />
    </v-col>

    <pot @change="formCopy.name = $event" />

    <v-col cols="12" sm="6">
      <v-text-field-with-validation
        v-model="formCopy.preferredName"
        :data-test="`${prefixDataTest}__preferredName`"
        :rules="rules.preferredName"
        :label="$t('registration.personal_info.preferredName')"
        @input="capitalize('preferredName')" />
    </v-col>

    <v-col cols="12" sm="6">
      <v-select-with-validation
        v-model="formCopy.gender"
        :data-test="`${prefixDataTest}__gender`"
        :items="genderItems"
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
            min="1901"
            :rules="rules.year"
            :label="`${$t('registration.personal_info.year')}*`" />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { MessageBox, VSelectWithValidation, VTextFieldWithValidation } from '@libs/component-lib/components';
import { IOptionItemData } from '@libs/shared-lib/types';
import { IBirthDate, IHoneyPotIdentitySet, IIdentitySet, MemberDuplicateStatus } from '@libs/entities-lib/household-create';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import helpers from '@libs/shared-lib/helpers/helpers';
import { TranslateResult } from 'vue-i18n';
import Pot from './HoneyPot.vue';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../constants/validations';
import months from '../../constants/months';

const vueComponent: VueConstructor = Vue.extend({
  name: 'IdentityForm',

  components: {
    VSelectWithValidation,
    VTextFieldWithValidation,
    Pot,
    MessageBox,
  },

  props: {
    prefixDataTest: {
      type: String,
      default: 'personalInfo',
    },

    form: {
      type: Object as () => IIdentitySet,
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
      FeatureKeys,
      MemberDuplicateStatus,
      formCopy: null as IHoneyPotIdentitySet,
      helpers,
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
          birthday: this.fullDate ? { birthdate: this.computedBirthdate } : false,
          minimumAge: this.fullDate ? { birthdate: this.computedBirthdate, age: this.minAgeRestriction } : false,
        };
      }
      return {
        required: true,
        birthday: this.fullDate ? { birthdate: this.computedBirthdate } : false,
      };
    },

    computedBirthdate(): IBirthDate {
      return {
        year: this.formCopy.birthDate.year,
        month: this.formCopy.birthDate.month,
        day: this.formCopy.birthDate.day,
      };
    },

    fullDate(): boolean {
      return this.formCopy.birthDate.day !== null && this.formCopy.birthDate.day !== ''
        && this.formCopy.birthDate.month !== null && this.formCopy.birthDate.month !== ''
        && this.formCopy.birthDate.year !== null && this.formCopy.birthDate.year !== '';
    },

    isDuplicateWarning():boolean {
      return this.$registrationStore.isCRCRegistration() && this.form.duplicateStatusInDb === MemberDuplicateStatus.Duplicate;
    },

    duplicateMessage(): TranslateResult {
      // eslint-disable-next-line no-nested-ternary
      return this.isDuplicateWarning ? this.$t('errors.individual-appears-to-already-exist-in-the-system')
      : this.form.duplicateStatusInCurrentHousehold === MemberDuplicateStatus.Duplicate
      ? this.$t('errors.a-household-cannot-have-the-same-members-twice')
          : this.$t('errors.this-individual-already-exists-in-the-system');
    },
  },

  watch: {
    formCopy: {
      deep: true,
      handler(form: IHoneyPotIdentitySet) {
        if (form.gender && !form.gender.isOther) {
          form.genderOther = null;
        }
        this.$emit('change', { ...form,
        // keep the duplicate status up to date with the parent form
          duplicateStatusInDb: this.form.duplicateStatusInDb,
          duplicateStatusInCurrentHousehold: this.form.duplicateStatusInCurrentHousehold,
        });
      },
    },
  },

  created() {
    // name is for honey-pot (bots) its a fake field!
    this.formCopy = { name: '', ..._cloneDeep(this.form) };
    this.loadGender();
    this.prePopulate();
  },

  methods: {
    prePopulate() {
      if (!this.formCopy.gender) {
        this.formCopy.gender = this.genderItems.find((option: IOptionItemData) => option.isDefault);
      }
    },
    loadGender() {
      if (this.form.gender?.optionItemId) {
        const gender = this.genderItems.find((option: IOptionItemData) => option.id === this.form.gender.optionItemId);
        this.formCopy.gender = { ...gender, ...this.form.gender };
      }
    },

    capitalize(itemKey: string) {
      if (this.$hasFeature(FeatureKeys.AutoCapitalizationForRegistration)) {
        this.formCopy[itemKey] = helpers.capitalize(this.formCopy[itemKey]);
      }
    },
  },
});

export default vueComponent;
</script>
