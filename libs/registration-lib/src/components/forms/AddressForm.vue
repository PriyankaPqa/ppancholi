<template>
  <validation-observer ref="form" slim>
    <v-row>
      <v-col cols="12">
        <rc-google-autocomplete-with-validation
          ref="address__street_autocomplete"
          prepend-inner-icon="mdi-map-marker"
          data-test="address_autocomplete"
          :api-key="apiKey"
          :prediction-countries-restriction="form.country"
          :disable-autocomplete="disableAutocomplete"
          :label="`${$t('search_autocomplete.label')}`"
          @on-autocompleted="streetAddressAutocomplete($event, form)" />
      </v-col>
      <v-col cols="12" sm="9" md="8">
        <v-text-field-with-validation
          v-model="form.streetAddress"
          :data-test="`${prefixDataTest}__street`"
          :rules="rules.streetAddress"
          :label="`${$t('registration.addresses.streetAddress')} *`"
          @input="isEditMode ? resetGeoLocationInEditMode() : resetGeoLocation(form)"
          @keyup="formatAddressInput('streetAddress')" />
      </v-col>

      <v-col cols="6" sm="3" md="4">
        <v-text-field-with-validation
          v-model="form.unitSuite"
          :rules="rules.unitSuite"
          :data-test="`${prefixDataTest}__unitSuite`"
          :label="`${$t('registration.addresses.unit')}`" />
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-text-field-with-validation
          v-model="form.city"
          :rules="rules.city"
          :data-test="`${prefixDataTest}__city`"
          :label="`${$t('registration.addresses.city')} *`"
          @input="isEditMode ? resetGeoLocationInEditMode() : resetGeoLocation(form)"
          @keyup="formatAddressInput('city')" />
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-select-with-validation
          v-if="isCanada"
          v-model="form.province"
          :rules="rules.province"
          :data-test="`${prefixDataTest}__province`"
          :label="`${$t('registration.addresses.province')}*`"
          :items="canadianProvincesItems"
          @input="isEditMode ? resetGeoLocationInEditMode() : resetGeoLocation(form)" />
        <v-text-field-with-validation
          v-else
          v-model="form.specifiedOtherProvince"
          :rules="rules.specifiedOtherProvince"
          :data-test="`${prefixDataTest}__specifiedOtherProvince`"
          :label="`${$t('registration.addresses.province')}*`"
          @input="isEditMode ? resetGeoLocationInEditMode() : resetGeoLocation(form)" />
      </v-col>

      <v-col cols="6" sm="6" md="4">
        <v-text-field-with-validation
          v-model="form.postalCode"
          :rules="rules.postalCode"
          :data-test="`${prefixDataTest}__postalCode`"
          :label="`${$t('registration.addresses.postalCode')} *`"
          @input="isEditMode ? resetGeoLocationInEditMode() : resetGeoLocation(form)"
          @keyup="form.postalCode = form.postalCode ? form.postalCode.toUpperCase() : null" />
      </v-col>

      <v-col cols="12" sm="6" md="8">
        <rc-country-select-with-validation
          v-model="form.country"
          :rules="rules.country"
          :data-test="`${prefixDataTest}__country`"
          :label="`${$t('registration.addresses.country')} *`"
          @change="onChangeCountry($event, form, $refs.form)" />
      </v-col>
    </v-row>
  </validation-observer>
</template>

<script lang="ts">

import {
  VSelectWithValidation,
  VTextFieldWithValidation,
  RcGoogleAutocompleteWithValidation,
  RcCountrySelectWithValidation,
} from '@libs/component-lib/components';
import { IAddress } from '@libs/entities-lib/household-create';
import _cloneDeep from 'lodash/cloneDeep';
import helpers from '@libs/shared-lib/helpers/helpers';
import Vue from 'vue';
import { useAutocomplete } from './mixins/useAutocomplete';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../constants/validations';

export default Vue.extend({
  name: 'AddressForm',

  components: {
    VSelectWithValidation,
    VTextFieldWithValidation,
    RcGoogleAutocompleteWithValidation,
    RcCountrySelectWithValidation,
  },

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

    disableAutocomplete: {
      type: Boolean,
      required: true,
    },

    isEditMode: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    const { streetAddressAutocomplete, resetGeoLocation, onChangeCountry } = useAutocomplete();
    return { streetAddressAutocomplete, resetGeoLocation, onChangeCountry };
  },

  data() {
    return {
      form: null as IAddress,
      backUpForm: null as IAddress,
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
          required: this.isCanada,
        },
        specifiedOtherProvince: {
          required: !this.isCanada,
          max: MAX_LENGTH_SM,
        },
        city: {
          required: true,
          max: MAX_LENGTH_SM,
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

    isSameGeoLocation() : boolean {
      return (
      this.form.streetAddress === this.backUpForm.streetAddress
      && this.form.city === this.backUpForm.city
      && this.form.province === this.backUpForm.province
      && this.form.specifiedOtherProvince === this.backUpForm.specifiedOtherProvince
      && this.form.postalCode === this.backUpForm.postalCode
    );
    },

    isSameUnit(): boolean {
      return this.form.unitSuite === this.backUpForm.unitSuite;
    },
  },

  watch: {
    form: {
      deep: true,
      handler(form: IAddress) {
        // This part is for the scenario when the user has changed the address information( which will reset geolocation), and then change it back to the previous one.
        // We want to keep the geolocation data seems the address hasn't been changed
        if (this.isSameGeoLocation && this.isSameUnit) {
          this.$emit('change', this.backUpForm);
        } else {
          this.$emit('change', form);
        }
      },
    },
  },

  created() {
    this.form = this.homeAddress;
    this.backUpForm = _cloneDeep(this.homeAddress);
  },

  methods: {
    // Here we want to disable $resetGeoLocation when initial load in edit mode
    resetGeoLocationInEditMode() {
      !this.isSameGeoLocation && this.resetGeoLocation(this.form);
    },

     formatAddressInput(item: string) {
      if (this.form[item]) {
        this.form[item] = helpers.toTitleCase(this.form[item]);
      }
    },
  },
});
</script>
