<template>
  <validation-observer ref="form" slim>
    <v-row>
      <v-col v-if="!hideTitle" cols="12">
        <div class="rc-heading-5">
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
        </div>
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

      <v-col
        v-if="showCrcProvidedAndCheckInCheckOut"
        class="pl-3"
        data-test="crc_provided_check_in_check_out"
        cols="12"
        sm="6"
        md="8">
        <template v-if="form.hasCrcProvided()">
          <div class="font-weight-bold ">
            {{ $t('impactedIndividuals.temporary_address.edit.crc_provided_title') }}
          </div>
          <div class="pb-8">
            <v-radio-group
              v-model="form.crcProvided"
              row
              hide-details>
              <v-radio :label="$t('common.yes')" :value="true" data-test="CRC_provided_yes" />
              <v-radio :label="$t('common.no')" :value="false" data-test="CRC_provided_no" />
            </v-radio-group>
          </div>
        </template>
        <div v-if="form.hasCheckInCheckOut()" class="py-4">
          <date-range
            id="currentAddressForm"
            :attach="true"
            :locale="$i18n.locale"
            :value="checkInCheckOutDate"
            display-format="MMM d, yyyy"
            :start-label="$t('impactedIndividuals.temporary_address.check_in')"
            :end-label="$t('impactedIndividuals.temporary_address.check_out')"
            @input="setCheckInCheckOut($event)" />
        </div>
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
          @on-autocompleted="streetCurrentAddressAutocomplete($event, form)" />
      </v-col>

      <template v-if="addressType">
        <v-col v-if="form.requiresPlaceName()" cols="12" sm="9" md="8" :class="{ 'py-0': compactView }">
          <v-text-field-with-validation
            v-model="form.placeName"
            background-color="white"
            :rules="rules.placeName"
            :data-test="`${prefixDataTest}__placeName`"
            :label="placeNameLabel"
            @keyup="formatAddressInput('placeName')" />
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
            :items="currentShelterLocations"
            @change="form.placeNumber = null" />
        </v-col>

        <v-col v-if="form.hasPlaceNumber() || form.requiresShelterLocation()" cols="6" sm="3" md="4" :class="{ 'py-0': compactView }">
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
            @input="resetGeoLocation(form.address)"
            @keyup="formatAddressInput('streetAddress', 'address')" />
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
            @input="resetGeoLocation(form.address)"
            @keyup="formatAddressInput('city', 'address')" />
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
            @input="resetGeoLocation(form.address)" />
          <v-text-field-with-validation
            v-else
            v-model="form.address.specifiedOtherProvince"
            background-color="white"
            :rules="rules.specifiedOtherProvince"
            :data-test="`${prefixDataTest}__specifiedOtherProvince`"
            :label="`${$t('registration.addresses.province')}*`"
            @input="resetGeoLocation(form.address)" />
        </v-col>

        <v-col v-if="form.hasPostalCode()" cols="6" sm="6" md="4" :class="{ 'py-0': compactView }">
          <v-text-field-with-validation
            v-model="form.address.postalCode"
            background-color="white"
            :rules="rules.postalCode"
            :data-test="`${prefixDataTest}__postalCode`"
            :label="`${$t('registration.addresses.postalCode')}`"
            @input="resetGeoLocation(form.address)"
            @keyup="form.address.postalCode = form.address.postalCode ? form.address.postalCode.toUpperCase() : null" />
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
import { VForm } from '@libs/shared-lib/types';
import {
  ECurrentAddressTypes,
  ICurrentAddress,
  CurrentAddress,
} from '@libs/entities-lib/household-create';
import helpers from '@libs/shared-lib/helpers/helpers';
import DateRange from '@libs/component-lib/components/molecule/RcFilterToolbar/inputs/DateRange.vue';
import Vue from 'vue';
import { EEventLocationStatus, IEventGenericLocation } from '@libs/entities-lib/event';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../constants/validations';
import { useAutocomplete } from './mixins/useAutocomplete';

export default Vue.extend({
  name: 'CurrentAddressForm',

  components: {
    VSelectWithValidation,
    VTextFieldWithValidation,
    RcGoogleAutocompleteWithValidation,
    RcCountrySelectWithValidation,
    DateRange,
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
      type: Array as () => IEventGenericLocation[],
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

    showCrcProvidedAndCheckInCheckOut: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    const { streetCurrentAddressAutocomplete, resetGeoLocation, onChangeCountry } = useAutocomplete();
    return { streetCurrentAddressAutocomplete, resetGeoLocation, onChangeCountry };
  },

  data() {
    return {
      form: null as ICurrentAddress,
      previousType: null,
      checkInCheckOutDate: [] as string[],
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
          max: MAX_LENGTH_SM,
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

    currentShelterLocations(): IEventGenericLocation[] {
      return this.shelterLocations.filter((s) => s.status === EEventLocationStatus.Active
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
    this.checkInCheckOutDate = [this.form.checkIn, this.form.checkOut];
  },

  methods: {
    changeType(type: ECurrentAddressTypes) {
      this.form.reset(type);
      (this.$refs.form as VForm).reset();
      this.checkInCheckOutDate = [null, null];
    },

    onCountryChange() {
      this.form.reset(this.form.addressType, true, this.form.address.country);
      (this.$refs.form as VForm).reset();
    },

    setCheckInCheckOut(newCheckInCheckOut: string[]) {
      this.form.checkIn = newCheckInCheckOut[0];
      this.form.checkOut = newCheckInCheckOut[1];
      this.checkInCheckOutDate = [newCheckInCheckOut[0], newCheckInCheckOut[1]];
    },

    formatAddressInput(item: string, path: string = null) {
        if (path && this.form[path][item]) {
          this.form[path][item] = helpers.toTitleCase(this.form[path][item]);
        } else if (this.form[item]) {
          this.form[item] = helpers.toTitleCase(this.form[item]);
        }
    },
  },

});

</script>
