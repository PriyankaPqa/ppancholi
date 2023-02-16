<template>
  <validation-observer ref="form" slim>
    <v-row>
      <v-col v-if="!hideTitle" cols="12">
        <h5 class="rc-heading-5">
          {{ $t('registration.addresses.currentAddress') }}
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn small class="ml-1" icon :aria-label="$t('tooltip.temporary_address')" data-test="pageContent__opeHelp" v-on="on">
                <v-icon small>
                  mdi-help-circle-outline
                </v-icon>
              </v-btn>
            </template>
            <span>{{ $t('tooltip.temporary_address') }}</span>
          </v-tooltip>
        </h5>
      </v-col>

      <v-col cols="12" sm="6" md="8" :class="{ 'pb-0': compactView }">
        <v-select-with-validation
          ref="addressType"
          background-color="white"
          :value="form.addressType"
          :rules="rules.addressType"
          item-value="value"
          :data-test="`${prefixDataTest}__currentAddressType`"
          :label="`${$t('registration.addresses.addressType')} *`"
          :items="currentAddressTypeItems"
          @change="changeType($event)" />
      </v-col>

      <v-col v-if="form.hasStreet()" cols="12">
        <rc-google-autocomplete-with-validation
          prepend-inner-icon="mdi-map-marker"
          background-color="white"
          data-test="temporary_address_autocomplete"
          :api-key="apiKey"
          :disable-autocomplete="disableAutocomplete"
          :prediction-types="predictionTypes"
          :prediction-countries-restriction="form.address.country"
          :label="`${$t('search_autocomplete.label')}`"
          @on-autocompleted="$streetCurrentAddressAutocomplete($event)" />
      </v-col>

      <template v-if="addressType">
        <v-col v-if="form.requiresPlaceName()" cols="12" sm="9" md="8" :class="{ 'py-0': compactView }">
          <v-text-field-with-validation
            v-model="form.placeName"
            background-color="white"
            :rules="rules.placeName"
            :data-test="`${prefixDataTest}__placeName`"
            :label="placeNameLabel" />
        </v-col>

        <v-col v-if="form.requiresShelterLocation() && currentShelterLocations.length > 0" cols="12" sm="6" md="8" :class="{ 'py-0': compactView }">
          <v-select-with-validation
            v-model="form.shelterLocation"
            background-color="white"
            :rules="rules.shelterLocation"
            :item-text="(e) => $m(e.name)"
            return-object
            :data-test="`${prefixDataTest}__shelterLocation`"
            :label="`${$t('registration.addresses.temporaryAddressTypes.Shelter')} *`"
            :items="currentShelterLocations" />
        </v-col>

        <v-col v-if="form.hasPlaceNumber() || (enableShelterLocationNumber && form.requiresShelterLocation())" cols="6" sm="3" md="4" :class="{ 'py-0': compactView }">
          <v-text-field-with-validation
            v-model="form.placeNumber"
            background-color="white"
            :rules="rules.placeNumber"
            :data-test="`${prefixDataTest}__placeNumber`"
            :label="placeNumberLabel" />
        </v-col>

        <v-col v-if="form.hasStreet()" cols="12" sm="9" md="8" :class="{ 'py-0': compactView }">
          <v-text-field-with-validation
            v-model="form.address.streetAddress"
            background-color="white"
            :data-test="`${prefixDataTest}__street`"
            :rules="rules.streetAddress"
            :label="`${$t('registration.addresses.streetAddress')}`"
            @input="$resetGeoLocation()" />
        </v-col>

        <v-col v-if="form.hasUnitSuite()" cols="6" sm="3" md="4" :class="{ 'py-0': compactView }">
          <v-text-field-with-validation
            v-model="form.address.unitSuite"
            background-color="white"
            :rules="rules.unitSuite"
            :data-test="`${prefixDataTest}__unitSuite`"
            :label="$t('registration.addresses.unit')" />
        </v-col>
        <v-col v-else cols="6" sm="3" md="4" />

        <v-col v-if="form.requiresCity()" cols="12" sm="6" md="4" :class="{ 'py-0': compactView }">
          <v-text-field-with-validation
            v-model="form.address.city"
            background-color="white"
            :rules="rules.city"
            :data-test="`${prefixDataTest}__city`"
            :label="`${$t('registration.addresses.city')} *`"
            @input="$resetGeoLocation()" />
        </v-col>

        <v-col v-if="form.requiresProvince()" cols="12" sm="6" md="4" :class="{ 'py-0': compactView }">
          <v-select-with-validation
            v-if="isCanada"
            v-model="form.address.province"
            background-color="white"
            :rules="rules.province"
            :data-test="`${prefixDataTest}__province`"
            :label="`${$t('registration.addresses.province')} *`"
            :items="canadianProvincesItems"
            @input="$resetGeoLocation()" />
          <v-text-field-with-validation
            v-else
            v-model="form.address.specifiedOtherProvince"
            background-color="white"
            :rules="rules.specifiedOtherProvince"
            :data-test="`${prefixDataTest}__specifiedOtherProvince`"
            :label="`${$t('registration.addresses.province')}*`"
            @input="$resetGeoLocation()" />
        </v-col>

        <v-col v-if="form.hasPostalCode()" cols="6" sm="6" md="4" :class="{ 'py-0': compactView }">
          <v-text-field-with-validation
            v-model="form.address.postalCode"
            background-color="white"
            :rules="rules.postalCode"
            :data-test="`${prefixDataTest}__postalCode`"
            :label="`${$t('registration.addresses.postalCode')}`"
            @input="$resetGeoLocation()" />
        </v-col>

        <v-col v-if="form.requiresCountry()" cols="12" sm="6" md="8" :class="{ 'py-0': compactView }">
          <rc-country-select-with-validation
            v-model="form.address.country"
            background-color="white"
            :rules="rules.country"
            :data-test="`${prefixDataTest}__country`"
            :label="`${$t('registration.addresses.country')} *`"
            @change="onCountryChange()" />
        </v-col>
      </template>
    </v-row>
  </validation-observer>
</template>

<script lang="ts">
import {
  RcCountrySelectWithValidation,
  RcGoogleAutocompleteWithValidation,
  VSelectWithValidation,
  VTextFieldWithValidation,
} from '@libs/component-lib/components';
import { TranslateResult } from 'vue-i18n';
import mixins from 'vue-typed-mixins';
import { EOptionItemStatus, VForm } from '@libs/shared-lib/types';
import {
  ECurrentAddressTypes,
  IShelterLocationData,
  ICurrentAddress,
  CurrentAddress,
} from '@libs/entities-lib/household-create';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../constants/validations';

import googleAutoCompleteMixin from './mixins/address';

export default mixins(googleAutoCompleteMixin).extend({
  name: 'CurrentAddressForm',

  components: {
    VSelectWithValidation,
    VTextFieldWithValidation,
    RcGoogleAutocompleteWithValidation,
    RcCountrySelectWithValidation,
  },

  props: {
    prefixDataTest: {
      type: String,
      default: 'tempAddress',
    },

    currentAddress: {
      type: Object as () => ICurrentAddress,
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

    currentAddressTypeItems: {
      type: Array as () => Record<string, unknown>[],
      required: true,
    },

    shelterLocations: {
      type: Array as () => IShelterLocationData[],
      required: true,
    },

    noFixedHome: {
      type: Boolean,
      required: true,
    },

    hideTitle: {
      type: Boolean,
      default: false,
    },

    compactView: {
      type: Boolean,
      default: false,
    },

    disableAutocomplete: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      form: null as ICurrentAddress,
      previousType: null,
    };
  },

  computed: {
    addressType(): ECurrentAddressTypes {
      return this.form.addressType;
    },

    rules(): Record<string, unknown> {
      return {
        addressType: {
          required: true,
        },
        country: {
          required: this.currentAddress.requiresCountry(),
        },
        streetAddress: {
          max: MAX_LENGTH_MD,
        },
        province: {
          required: this.currentAddress.requiresProvince() && this.isCanada,
        },
        specifiedOtherProvince: {
          required: this.currentAddress.requiresProvince() && !this.isCanada,
          max: MAX_LENGTH_SM,
        },
        city: {
          required: this.currentAddress.requiresCity(),
          max: MAX_LENGTH_MD,
        },
        postalCode: {
          max: MAX_LENGTH_SM,
          canadianPostalCode: this.isCanada,
        },
        placeName: {
          required: this.currentAddress.requiresPlaceName(),
          max: MAX_LENGTH_MD,
        },
        placeNumber: {
          max: MAX_LENGTH_SM,
        },
        unitSuite: {
          max: MAX_LENGTH_SM,
        },
        shelterLocation: {
          required: true,
        },
      };
    },

    enableShelterLocationNumber(): boolean {
      return this.$hasFeature(FeatureKeys.AddShelterRoomNumber);
    },

    isCanada(): boolean {
      return this.form?.address?.country === 'CA';
    },

    placeNameLabel(): TranslateResult {
      switch (this.addressType) {
        case (ECurrentAddressTypes.Campground):
          return `${this.$t('registration.addresses.campgroundName')} *`;
        case (ECurrentAddressTypes.HotelMotel):
          return `${this.$t('registration.addresses.hotelName')} *`;
        case (ECurrentAddressTypes.MedicalFacility):
          return `${this.$t('registration.addresses.medicalName')} *`;
        case (ECurrentAddressTypes.Other):
          return `${this.$t('registration.personal_info.pleaseSpecify')} *`;
        default:
          return '';
      }
    },

    placeNumberLabel(): TranslateResult {
      switch (this.addressType) {
        case (ECurrentAddressTypes.Campground):
          return this.$t('registration.addresses.lotNumber');
        case (ECurrentAddressTypes.HotelMotel):
        case (ECurrentAddressTypes.MedicalFacility):
          return this.$t('registration.addresses.roomNumber');
        case (ECurrentAddressTypes.Shelter):
          return this.$t('registration.addresses.shelterLocationNumber');
        default:
          return '';
      }
    },

    currentShelterLocations(): IShelterLocationData[] {
      return this.shelterLocations.filter((s: IShelterLocationData) => s.status === EOptionItemStatus.Active
        || s.id === this.currentAddress?.shelterLocation?.id);
    },

    predictionTypes(): Array<string> {
      const predictionForAddress = {
        [ECurrentAddressTypes.Unknown]: null,
        [ECurrentAddressTypes.RemainingInHome]: null,
        [ECurrentAddressTypes.Campground]: null,
        [ECurrentAddressTypes.FriendsFamily]: null,
        [ECurrentAddressTypes.MedicalFacility]: null,
        [ECurrentAddressTypes.Other]: null,
        [ECurrentAddressTypes.Shelter]: null,
      } as Record<ECurrentAddressTypes, Array<string>>;

      return predictionForAddress[this.addressType];
    },
  },

  watch: {
    form: {
      deep: true,
      handler(newForm: ICurrentAddress) {
        this.$emit('change', newForm);
      },
    },
    noFixedHome(noFixedHome) {
      if (noFixedHome && this.form.addressType === ECurrentAddressTypes.RemainingInHome) {
        this.form = new CurrentAddress();
      }
    },
  },

  created() {
    this.form = this.currentAddress;
  },

  methods: {
    changeType(type: ECurrentAddressTypes) {
      this.form.reset(type);
      (this.$refs.form as VForm).reset();
    },

    onCountryChange() {
      this.form.reset(this.form.addressType, true, this.form.address.country);
      (this.$refs.form as VForm).reset();
    },
  },

});

</script>
