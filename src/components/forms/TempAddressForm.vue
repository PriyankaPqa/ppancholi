<template>
  <validation-observer ref="form" slim>
    <v-row>
      <v-col cols="12">
        <h5 class="rc-heading-5">
          {{ $t('registration.addresses.temporaryAddress') }}
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn small class="ml-1" icon data-test="pageContent__opeHelp" v-on="on">
                <v-icon small>
                  mdi-help-circle-outline
                </v-icon>
              </v-btn>
            </template>
            <span>{{ $t('common.help') }}</span>
          </v-tooltip>
        </h5>
      </v-col>

      <v-col cols="12" sm="6" md="8">
        <v-select-with-validation
          ref="temporaryAddressType"
          :value="form.temporaryAddressType"
          :rules="rules.temporaryAddressType"
          item-value="value"
          :data-test="`${prefixDataTest}__temporaryAddressType`"
          :label="`${$t('registration.addresses.temporaryAddressType')} *`"
          :items="temporaryAddressTypeItems"
          @change="changeType($event)" />
      </v-col>

      <template v-if="temporaryAddressType">
        <v-col v-if="temporaryAddress.requiresPlaceName()" cols="12" sm="9" md="8">
          <v-text-field-with-validation
            v-model="form.placeName"
            :rules="rules.placeName"
            :data-test="`${prefixDataTest}__placeName`"
            :label="placeNameLabel" />
        </v-col>

        <v-col v-if="temporaryAddress.hasPlaceNumber()" cols="6" sm="3" md="4">
          <v-text-field-with-validation
            v-model="form.placeNumber"
            :rules="rules.placeNumber"
            :data-test="`${prefixDataTest}__placeNumber`"
            :label="placeNumberLabel" />
        </v-col>

        <v-col v-if="temporaryAddress.requiresCountry()" cols="12" sm="6" md="8">
          <rc-country-select-with-validation
            v-model="form.country"
            :rules="rules.country"
            :data-test="`${prefixDataTest}__country`"
            :label="`${$t('registration.addresses.country')} *`"
            @change="$onChangeCountry()" />
        </v-col>

        <v-col v-if="temporaryAddress.hasStreet()" cols="12" sm="9" md="8">
          <rc-google-autocomplete-with-validation
            v-model="form.street"
            :data-test="`${prefixDataTest}__street`"
            :rules="rules.street"
            :api-key="apiKey"
            :label="`${$t('registration.addresses.streetAddress')}`"
            @input="$resetGeoLocation()"
            @on-autocompleted="$streetAddressAutocomplete($event)" />
        </v-col>

        <v-col v-if="temporaryAddress.hasUnitSuite()" cols="6" sm="3" md="4">
          <v-text-field-with-validation
            v-model="form.unitSuite"
            :rules="rules.unitSuite"
            :data-test="`${prefixDataTest}__unitSuite`"
            :label="$t('registration.addresses.unit')" />
        </v-col>
        <v-col v-else cols="6" sm="3" md="4" />

        <v-col v-if="temporaryAddress.requiresCity()" cols="12" sm="6" md="4">
          <v-text-field-with-validation
            v-model="form.city"
            :rules="rules.city"
            :data-test="`${prefixDataTest}__city`"
            :label="`${$t('registration.addresses.city')} *`"
            @input="$resetGeoLocation()" />
        </v-col>

        <v-col v-if="temporaryAddress.requiresProvinceTerritory()" cols="12" sm="6" md="4">
          <v-select-with-validation
            v-if="isCanada"
            v-model="form.provinceTerritory"
            :rules="rules.provinceTerritory"
            :data-test="`${prefixDataTest}__province`"
            :label="`${$t('registration.addresses.province')} *`"
            :items="canadianProvincesItems"
            @input="$resetGeoLocation()" />
          <v-text-field-with-validation
            v-else
            v-model="form.provinceTerritory"
            :rules="rules.provinceTerritory"
            :data-test="`${prefixDataTest}__province`"
            :label="`${$t('registration.addresses.province')}*`"
            @input="$resetGeoLocation()" />
        </v-col>

        <v-col v-if="temporaryAddress.hasPostalCode()" cols="6" sm="6" md="4">
          <v-text-field-with-validation
            v-model="form.postalCode"
            :rules="rules.postalCode"
            :data-test="`${prefixDataTest}__postalCode`"
            :label="`${$t('registration.addresses.postalCode')}`"
            @input="$resetGeoLocation()" />
        </v-col>

        <v-col v-if="temporaryAddress.requiresShelterId()" cols="12" sm="6" md="8">
          <v-select-with-validation
            v-model="form.shelterId"
            :rules="rules.shelterId"
            :item-text="(e) => $m(e.name)"
            item-value="id"
            :data-test="`${prefixDataTest}__shelterLocation`"
            :label="`${$t('registration.addresses.temporaryAddressTypes.Shelter')} *`"
            :items="shelterLocations" />
        </v-col>
      </template>
    </v-row>
  </validation-observer>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  RcCountrySelectWithValidation,
  RcGoogleAutocompleteWithValidation,
  VSelectWithValidation,
  VTextFieldWithValidation,
} from '@crctech/component-library';
import { TranslateResult } from 'vue-i18n';
import { VForm } from '../../types';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../constants/validations';
import { ETemporaryAddressTypes, ITemporaryAddress } from '../../entities/beneficiary';
import { IShelterLocation } from '../../entities/event';

import googleAutoCompleteMixin from './mixins/address';

export default Vue.extend({
  name: 'TempAddressForm',

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
      default: 'tempAddress',
    },

    temporaryAddress: {
      type: Object as () => ITemporaryAddress,
      required: true,
    },

    apiKey: {
      type: String,
      required: true,
    },

    canadianProvincesItems: {
      type: Array as () => Record<string, unknown>[],
      required: true,
    },

    temporaryAddressTypeItems: {
      type: Array as () => Record<string, unknown>[],
      required: true,
    },

    shelterLocations: {
      type: Array as () => IShelterLocation[],
      required: true,
    },
  },

  data() {
    return {
      form: null as ITemporaryAddress,
      previousType: null,
    };
  },

  computed: {
    temporaryAddressType(): ETemporaryAddressTypes {
      return this.temporaryAddress.temporaryAddressType;
    },

    rules(): Record<string, unknown> {
      return {
        temporaryAddressType: {
          required: true,
        },
        country: {
          required: this.temporaryAddress.requiresCountry(),
        },
        street: {
          max: MAX_LENGTH_MD,
        },
        provinceTerritory: {
          required: this.temporaryAddress.requiresProvinceTerritory(),
          max: MAX_LENGTH_SM,
        },
        city: {
          required: this.temporaryAddress.requiresCity(),
          max: MAX_LENGTH_MD,
        },
        postalCode: {
          max: MAX_LENGTH_SM,
          canadianPostalCode: this.isCanada,
        },
        placeName: {
          required: this.temporaryAddress.requiresPlaceName(),
          max: MAX_LENGTH_MD,
        },
        placeNumber: {
          max: MAX_LENGTH_SM,
        },
        unitSuite: {
          max: MAX_LENGTH_SM,
        },
        shelterId: {
          required: true,
        },
      };
    },

    isCanada(): boolean {
      return this.form?.country === 'CA';
    },

    placeNameLabel(): TranslateResult {
      switch (this.temporaryAddressType) {
        case (ETemporaryAddressTypes.Campground):
          return `${this.$t('registration.addresses.campgroundName')} *`;
        case (ETemporaryAddressTypes.HotelMotel):
          return `${this.$t('registration.addresses.hotelName')} *`;
        case (ETemporaryAddressTypes.MedicalFacility):
          return `${this.$t('registration.addresses.medicalName')} *`;
        case (ETemporaryAddressTypes.Other):
          return `${this.$t('registration.personal_info.pleaseSpecify')} *`;
        default:
          return '';
      }
    },

    placeNumberLabel(): TranslateResult {
      switch (this.temporaryAddressType) {
        case (ETemporaryAddressTypes.Campground):
          return this.$t('registration.addresses.lotNumber');
        case (ETemporaryAddressTypes.HotelMotel):
        case (ETemporaryAddressTypes.MedicalFacility):
          return this.$t('registration.addresses.roomNumber');
        default:
          return '';
      }
    },
  },

  watch: {
    form: {
      deep: true,
      handler(newForm: ITemporaryAddress) {
        this.$emit('change', newForm);
      },
    },
  },

  created() {
    this.form = this.temporaryAddress;
  },

  methods: {
    changeType(type: ETemporaryAddressTypes) {
      this.form.resetTemporaryAddress(type);
      (this.$refs.form as VForm).reset();
    },
  },

});

</script>
