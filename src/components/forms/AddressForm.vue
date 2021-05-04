<template>
  <validation-observer ref="form" slim>
    <v-row>
      <v-col cols="12" sm="6" md="8">
        <rc-country-select-with-validation
          v-model="form.country"
          :rules="rules.country"
          :data-test="`${prefixDataTest}__country`"
          :label="`${$t('registration.addresses.country')} *`"
          @change="$onChangeCountry($event)" />
      </v-col>

      <v-col cols="12" sm="9" md="8">
        <rc-google-autocomplete-with-validation
          ref="address__street_autocomplete"
          v-model="form.streetAddress"
          :data-test="`${prefixDataTest}__street`"
          :rules="rules.streetAddress"
          :api-key="apiKey"
          :label="`${$t('registration.addresses.streetAddress')} *`"
          @input="$resetGeoLocation()"
          @on-autocompleted="$streetAddressAutocomplete($event)" />
      </v-col>

      <v-col cols="6" sm="3" md="4">
        <v-text-field-with-validation
          v-model="form.unitSuite"
          :data-test="`${prefixDataTest}__unitSuite`"
          :label="`${$t('registration.addresses.unit')}`" />
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-text-field-with-validation
          v-model="form.city"
          :rules="rules.city"
          :data-test="`${prefixDataTest}__city`"
          :label="`${$t('registration.addresses.city')} *`"
          @input="$resetGeoLocation()" />
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-select-with-validation
          v-if="isCanada"
          v-model="form.province"
          :rules="rules.province"
          :data-test="`${prefixDataTest}__province`"
          :label="`${$t('registration.addresses.province')}*`"
          :items="canadianProvincesItems"
          @input="$resetGeoLocation()" />
        <v-text-field-with-validation
          v-else
          v-model="form.province"
          :rules="rules.province"
          :data-test="`${prefixDataTest}__province`"
          :label="`${$t('registration.addresses.province')}*`"
          @input="$resetGeoLocation()" />
      </v-col>

      <v-col cols="6" sm="6" md="4">
        <v-text-field-with-validation
          v-model="form.postalCode"
          :rules="rules.postalCode"
          :data-test="`${prefixDataTest}__postalCode`"
          :label="`${$t('registration.addresses.postalCode')} *`"
          @input="$resetGeoLocation()" />
      </v-col>
    </v-row>
  </validation-observer>
</template>

<script lang="ts">
import Vue from 'vue';

import {
  VSelectWithValidation,
  VTextFieldWithValidation,
  RcGoogleAutocompleteWithValidation,
  RcCountrySelectWithValidation,
} from '@crctech/component-library';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../constants/validations';
import { IAddress } from '../../entities/beneficiary';
import googleAutoCompleteMixin from './mixins/address';

export default Vue.extend({
  name: 'AddressForm',

  components: {
    VSelectWithValidation,
    VTextFieldWithValidation,
    RcGoogleAutocompleteWithValidation,
    RcCountrySelectWithValidation,
  },

  mixins: [googleAutoCompleteMixin],

  props: {
    prefixDataTest: {
      type: String,
      default: 'address',
    },

    canadianProvincesItems: {
      type: Array as () => Record<string, unknown>[],
      required: true,
    },

    homeAddress: {
      type: Object as () => IAddress,
      required: true,
    },

    apiKey: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      form: null as IAddress,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        country: {
          required: true,
        },
        streetAddress: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        unitSuite: {
          max: MAX_LENGTH_SM,
        },
        province: {
          required: true,
          max: MAX_LENGTH_SM,
        },
        city: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        postalCode: {
          required: true,
          max: MAX_LENGTH_SM,
          canadianPostalCode: this.isCanada,
        },
      };
    },

    isCanada(): boolean {
      return this.form?.country === 'CA';
    },
  },

  watch: {
    form: {
      deep: true,
      handler(form: IAddress) {
        this.$emit('change', form);
      },
    },
  },

  created() {
    this.form = this.homeAddress;
  },
});
</script>
