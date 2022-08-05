<template>
  <v-row no-gutters justify="center">
    <v-col cols="12" md="9" sm="12">
      <validation-observer ref="form" v-slot="{ valid }" tag="div" data-test="search_IsRegistered">
        <v-row v-if="!hideTitle">
          <div class="rc-heading-5 ml-4">
            {{ $t(title) }}
          </div>
        </v-row>

        <with-root :show="!sameLine">
          <v-row>
            <v-col :col=" sameLine ? 12 : 6">
              <v-text-field-with-validation
                v-model="form.firstName"

                data-test="isRegistered__firstName"
                outlined
                :rules="rules.firstName"
                :label="$t('registration.personal_info.firstName')"
                @keyup.enter.native="search" />
            </v-col>
            <v-col :col=" sameLine ? 12 : 6" :class="[sameLine ? 'mt-n6': '']">
              <v-text-field-with-validation
                v-model="form.lastName"
                data-test="isRegistered__lastName"
                outlined
                :rules="rules.lastName"
                :label="$t('registration.personal_info.lastName')"
                @keyup.enter.native="search" />
            </v-col>
          </v-row>
        </with-root>

        <with-root :show="!sameLine">
          <v-row>
            <v-col :col=" sameLine ? 12 : 6" :class="[sameLine ? 'mt-n6': '']">
              <v-text-field-with-validation
                v-model="form.emailAddress"
                data-test="isRegistered__emailAddress"
                outlined
                :rules="rules.emailAddress"
                :label="$t('registration.personal_info.emailAddress')"
                @keyup.enter.native="search" />
            </v-col>
            <v-col :col=" sameLine ? 12 : 6" :class="[sameLine ? 'mt-n6': '']">
              <rc-phone-with-validation
                :value="phone"
                :rules="rules.phone"
                data-test="isRegistered__phoneNumber"
                outlined
                :label="$t('registration.isRegistered.phone')"
                @focusout="phone = $event"
                @keyup.enter.native="search" />
            </v-col>
          </v-row>
        </with-root>

        <with-root :show="!sameLine">
          <v-row>
            <v-col :col=" sameLine ? 12 : 6" :class="[sameLine ? 'mt-n6': '']">
              <v-text-field-with-validation
                v-model="form.registrationNumber"
                data-test="isRegistered__registrationNumber"
                outlined
                :rules="rules.registrationNumber"
                :label="$t('registration.isRegistered.registrationNumber')"
                @keyup.enter.native="search" />
            </v-col>
            <v-col :col=" sameLine ? 12 : 6" style="position: relative">
              <span class="rc-body14" style="position: absolute; top: -15px"> {{ $t('registration.isRegistered.birthdate') }}</span>
              <v-row id="birthdate">
                <v-col cols="6" class="pr-2">
                  <v-select-with-validation
                    v-model="birthDate.month"
                    clearable
                    :items="months"
                    :item-text="(item) => $t(item.label)"
                    item-value="number"
                    :rules="rules.month"
                    :label="`${$t('registration.personal_info.month')}${dateComponentNotEmpty ? '*' : ''}`" />
                </v-col>
                <v-col cols="3" class="pr-2">
                  <v-text-field-with-validation
                    v-model="birthDate.day"
                    type="number"
                    min="1"
                    max="31"
                    :rules="rules.day"
                    :label="`${$t('registration.personal_info.day')}${dateComponentNotEmpty ? '*' : ''}`" />
                </v-col>
                <v-col cols="3">
                  <v-text-field-with-validation
                    v-model="birthDate.year"
                    :rules="rules.year"
                    :label="`${$t('registration.personal_info.year')}${dateComponentNotEmpty ? '*' : ''}`" />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </with-root>

        <div :class="[sameLine ? 'mb-4 mt-n4 pl-3': '']">
          <v-btn
            data-test="search"
            :disabled="isEmpty(nonEmptySearchCriteria) || !valid"
            color="primary"
            :loading="loading"
            @click="search()">
            <v-icon left>
              mdi-magnify
            </v-icon>
            {{ $t('registration.isRegistered.search') }}
          </v-btn>
          <v-btn
            class="ml-4"
            :disabled="isEmpty(nonEmptySearchCriteria)"
            data-test="clearForm"
            @click="clear()">
            {{ $t('registration.isRegistered.clear') }}
          </v-btn>
        </div>
      </validation-observer>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPhoneWithValidation, VSelectWithValidation, VTextFieldWithValidation } from '@libs/component-lib/components';
import isEmpty from 'lodash/isEmpty';
import months from '@libs/registration-lib/constants/months';
import moment from 'moment';
import { MAX_LENGTH_MD } from '@libs/core-lib/constants/validations';
import { VForm } from '@libs/core-lib/types';
import WithRoot from '@/ui/views/components/WithRoot';

export default Vue.extend({
  name: 'HouseholdSearch',
  components: {
    RcPhoneWithValidation,
    VSelectWithValidation,
    VTextFieldWithValidation,
    WithRoot,
  },
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    isSplitMode: {
      type: Boolean,
      default: false,
    },
    hideTitle: {
      type: Boolean,
      default: false,
    },
    sameLine: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'registration.isRegistered.title',
    },
  },
  data() {
    return {
      isEmpty,
      months,
      birthDate: {
        month: null,
        day: null,
        year: null,
      },
      phone: {
        number: '',
        countryISO2: '',
        e164Number: '',
      },
      form: {
        firstName: '',
        lastName: '',
        emailAddress: '',
        phone: '',
        registrationNumber: '',
        birthDate: '',
      },
    };
  },
  computed: {
    // Will return only non empty properties from the form object, Ex: {firstName: 'x', lastName: 'y'}
    nonEmptySearchCriteria(): {[key: string]: string} {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line
      return Object.entries(this.form).reduce((a, [k, v]) => (v ? (a[k] = v, a) : a), {});
    },

    rules(): Record<string, unknown> {
      return {
        firstName: {
          max: MAX_LENGTH_MD,
        },
        lastName: {
          max: MAX_LENGTH_MD,
        },
        emailAddress: {
          max: MAX_LENGTH_MD,
          email: true,
        },
        phone: {
          phone: true,
        },
        registrationNumber: {
          registrationNumber: true,
        },
        month: {
          required: this.dateComponentNotEmpty,
          birthday: this.dateComponentNotEmpty ? { birthdate: this.birthDate } : false,
        },
        day: {
          required: this.dateComponentNotEmpty,
          birthday: this.dateComponentNotEmpty ? { birthdate: this.birthDate } : false,
        },
        year: {
          required: this.dateComponentNotEmpty,
          birthday: this.dateComponentNotEmpty ? { birthdate: this.birthDate } : false,
        },
      };
    },

    monthEmpty(): boolean {
      return this.birthDate.month === '' || this.birthDate.month === null;
    },

    dateComponentNotEmpty(): boolean {
      return !isEmpty(this.birthDate.day)
        || !this.monthEmpty
        || !isEmpty(this.birthDate.year);
    },
  },
  watch: {
    phone(newVal) {
      if (newVal.number === undefined) {
        newVal.number = '';
      }
      if (newVal.e164Number) {
        this.form.phone = newVal.e164Number;
      }
    },
    birthDate: {
      deep: true,
      handler(newVal) {
        // We trigger validation so user is aware he has to fill birthdate fields
        this.$nextTick(() => {
          if (this.$refs.form) {
            (this.$refs.form as VForm).validate();
          }
        });
        if (this.dateComponentNotEmpty) {
          this.form.birthDate = moment({
            month: newVal.month - 1,
            day: newVal.day,
            year: newVal.year,
          }).format('YYYY-MM-DD');
        }
      },
    },
  },

  created() {
    // when displayed as part of the split flow, the name fields should be pre-filled with the name of the new primary member
    if (this.isSplitMode) {
      this.fillInSplitHouseholdData();
    }
  },

  methods: {
    clear() {
      this.form = {
        firstName: '',
        lastName: '',
        emailAddress: '',
        phone: '',
        registrationNumber: '',
        birthDate: '',
      };
      this.phone = {
        number: '',
        countryISO2: '',
        e164Number: '',
      };
      this.birthDate = {
        month: null,
        day: null,
        year: null,
      };
      this.$storage.registration.mutations.setHouseholdResultsShown(false);
    },
    async search() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid && !isEmpty(this.nonEmptySearchCriteria)) {
        this.$emit('search', this.nonEmptySearchCriteria);
      }
    },

    fillInSplitHouseholdData() {
      const splitHouseholdMembers = this.$store.state.registration.splitHousehold?.splitMembers;
      if (splitHouseholdMembers) {
        this.form.firstName = splitHouseholdMembers.primaryMember.identitySet.firstName;
        this.form.lastName = splitHouseholdMembers.primaryMember.identitySet.lastName;
      }
    },
  },
});
</script>
