<template>
  <v-row>
    <v-col cols="12" class="pb-0">
      <div class="rc-body16 fw-bold">
        {{ $t('registration.addresses.homeAddress') }}
      </div>
    </v-col>

    <v-col cols="8">
      <v-checkbox-with-validation
        v-model="form.noFixedHome"
        :data-test="`${prefixDataTest}__noFixedHomeAddress`"
        :label="`${$t('registration.addresses.noFixedHomeAddress')}`" />
    </v-col>

    <template v-if="!form.noFixedHome">
      <v-col cols="12" sm="6" md="8">
        <validation-provider
          v-slot="{ errors, classes }"
          :rules="rules.country"
          name="country"
          mode="aggressive"
          :data-test="`${prefixDataTest}__country`">
          <rc-country-select
            v-model="form.country"
            outlined
            :error-messages="errors"
            :class="classes"
            :label="`${$t('registration.addresses.country')} *`" />
        </validation-provider>
      </v-col>

      <v-col cols="12" sm="9" md="8">
        <validation-provider v-slot="{ errors, classes }" :rules="rules.street" mode="aggressive" :data-test="`${prefixDataTest}__street`">
          <rc-google-autocomplete
            ref="address__street_autocomplete"
            v-model="form.street"
            :class="classes"
            :error-messages="errors"
            :api-key="apiKey"
            outlined
            :placeholder="`${$t('registration.addresses.streetAddress')} *`"
            @on-autocompleted="streetAddressAutocomplete" />
        </validation-provider>
      </v-col>

      <v-col cols="12" sm="3" md="4">
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
          :label="`${$t('registration.addresses.city')} *`" />
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-select-with-validation
          v-model="form.provinceTerritory"
          :rules="rules.provinceTerritory"
          :data-test="`${prefixDataTest}__province`"
          :label="`${$t('registration.addresses.province')} *`"
          :items="canadianProvincesItems" />
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-text-field-with-validation
          v-model="form.postalCode"
          :rules="rules.postalCode"
          :data-test="`${prefixDataTest}__postalCode`"
          :label="`${$t('registration.addresses.postalCode')} *`" />
      </v-col>
    </template>

    <v-col cols="12" class="pb-0">
      <div class="rc-body16 fw-bold">
        {{ $t('registration.addresses.temporaryAddress') }}
      </div>
    </v-col>

    <v-col cols="12" sm="8" md="8">
      <v-select-with-validation
        v-model="form.temporaryAddressType"
        :rules="rules.temporaryAddressType"
        return-object
        :data-test="`${prefixDataTest}__temporaryAddressType`"
        :label="`${$t('registration.addresses.temporaryAddressType')} *`"
        :items="temporaryAddressTypeItems" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { localStorageKeys } from '@/constants/localStorage';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '@/constants/validations';
import {
  VSelectWithValidation,
  VTextFieldWithValidation,
  VCheckboxWithValidation,
  RcGoogleAutocomplete,
  RcCountrySelect,
} from '@crctech/component-library';
import {
  Beneficiary,
  ETemporaryAddressTypes,
  IAddresses,
} from '@/entities/beneficiary';
import utils from '@/entities/utils';
import _cloneDeep from 'lodash/cloneDeep';
import { ECanadaProvinces } from '@/types';

export default Vue.extend({
  name: 'Addresses',

  components: {
    VSelectWithValidation,
    VTextFieldWithValidation,
    VCheckboxWithValidation,
    RcGoogleAutocomplete,
    RcCountrySelect,
  },

  props: {
    beneficiary: {
      type: Beneficiary,
      required: true,
    },
    prefixDataTest: {
      type: String,
      default: 'addresses',
    },
  },

  data() {
    return {
      form: null as IAddresses,
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VUE_APP_GOOGLE_API_KEY,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        country: {
          required: true,
        },
        street: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        unitSuite: {
          max: MAX_LENGTH_SM,
        },
        provinceTerritory: {
          required: true,
        },
        city: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        postalCode: {
          required: true,
          max: MAX_LENGTH_MD,
          canadianPostalCode: this.isCanada,
        },
        temporaryAddressType: {
          required: true,
        },
      };
    },
    canadianProvincesItems(): Record<string, unknown>[] {
      return utils.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces');
    },

    temporaryAddressTypeItems(): Record<string, unknown>[] {
      const returned = utils.enumToTranslatedCollection(ETemporaryAddressTypes, 'registration.addresses.temporaryAddressTypes');
      const remainInHome = returned.find((element) => element.value === ETemporaryAddressTypes.RemainingInHome);
      returned.splice(returned.indexOf(remainInHome), 1);
      if (!this.form.noFixedHome) { returned.unshift(remainInHome); }
      return returned;
    },

    isCanada(): boolean {
      return this.form.country === 'CA';
    },
  },

  watch: {
    form: {
      deep: true,
      handler(newValue: IAddresses) {
        this.$emit('update-entity', 'addresses', newValue);
      },
    },
  },

  created() {
    this.form = _cloneDeep(this.beneficiary.addresses);
    this.prepopulate();
  },

  methods: {
    onTemporaryAddressTypeChange() {
      // TODO Implement this
    },
    // eslint-disable-next-line
    streetAddressAutocomplete(event: any) {
      this.$set(this.form, 'country', event.country);
      this.$set(this.form, 'provinceTerritory', ECanadaProvinces[event.province]);
      this.$set(this.form, 'postalCode', event.postalCode);
      this.$set(this.form, 'city', event.city);
      this.$set(this.form, 'street', event.street);
    },
    prepopulate() {
      if (!this.form.country) {
        this.form.country = 'CA';
      }
    },
  },
});
</script>
