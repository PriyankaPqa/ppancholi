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
          :data-test="`${prefixDataTest}__country`"
          mode="aggressive">
          <rc-country-select
            v-model="form.country"
            outlined
            :error-messages="errors"
            :class="classes"
            :label="`${$t('registration.addresses.country')} *`"
            @input="onInput()" />
        </validation-provider>
      </v-col>

      <v-col cols="12" sm="9" md="8">
        <validation-provider v-slot="{ errors, classes }" :rules="rules.street" mode="aggressive" :data-test="`${prefixDataTest}__street`">
          <rc-google-autocomplete
            ref="address__street_autocomplete"
            v-model="form.street"
            data-test="address__street_autocomplete"
            :class="classes"
            :error-messages="errors"
            :api-key="apiKey"
            outlined
            :placeholder="`${$t('registration.addresses.streetAddress')} *`"
            @input="onInput()"
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
          :label="`${$t('registration.addresses.city')} *`"
          @input="onInput()" />
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-select-with-validation
          v-model="form.provinceTerritory"
          :rules="rules.provinceTerritory"
          :data-test="`${prefixDataTest}__province`"
          :label="`${$t('registration.addresses.province')} *`"
          :items="canadianProvincesItems"
          @input="onInput()" />
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-text-field-with-validation
          v-model="form.postalCode"
          :rules="rules.postalCode"
          :data-test="`${prefixDataTest}__postalCode`"
          :label="`${$t('registration.addresses.postalCode')} *`"
          @input="onInput()" />
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
  ETemporaryAddressTypes,
  IAddresses,
} from '@/entities/beneficiary';
import utils from '@/entities/utils';
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
    prefixDataTest: {
      type: String,
      default: 'addresses',
    },
  },

  data() {
    return {
      form: null,
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VUE_APP_GOOGLE_API_KEY,
      isAutocompleteAddress: false,
    };
  },

  computed: {
    addresses(): IAddresses {
      return this.$storage.beneficiary.getters.beneficiary().addresses;
    },

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
      const list = utils.enumToTranslatedCollection(ETemporaryAddressTypes, 'registration.addresses.temporaryAddressTypes');
      if (this.form.noFixedHome) {
        return list.filter((item) => item.value !== ETemporaryAddressTypes.RemainingInHome);
      }
      return list;
    },

    isCanada(): boolean {
      return this.form.country === 'CA';
    },
  },

  watch: {
    form: {
      deep: true,
      handler(form: IAddresses) {
        this.$storage.beneficiary.mutations.setAddresses(form);
      },
    },
  },

  created() {
    this.form = this.addresses;
    this.prePopulate();
  },

  methods: {
    onTemporaryAddressTypeChange() {
      // TODO Implement this
    },

    async streetAddressAutocomplete(autocomplete: any) {
      this.isAutocompleteAddress = true;
      this.form.country = autocomplete.country;
      this.form.provinceTerritory = ECanadaProvinces[autocomplete.province];
      this.form.postalCode = autocomplete.postalCode;
      this.form.city = autocomplete.city;
      this.form.street = autocomplete.street;
      this.form.geoLocation = autocomplete.location;

      await this.$nextTick();
      this.isAutocompleteAddress = false;
    },

    onInput() {
      if (!this.isAutocompleteAddress) {
        this.form.geoLocation.lat = null;
        this.form.geoLocation.lng = null;
      }
    },

    prePopulate() {
      if (!this.form.country) {
        this.form.country = 'CA';
      }
    },
  },
});
</script>
