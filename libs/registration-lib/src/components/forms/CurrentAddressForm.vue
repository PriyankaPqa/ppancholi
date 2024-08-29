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

      <v-col v-if="!bookingMode" cols="12" sm="6" md="8" :class="{ 'pb-0': compactView }">
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
        md="8"
        :class="{ 'py-0': compactView }">
        <template v-if="!bookingMode && form.hasCrcProvided()">
          <div class="font-weight-bold ">
            {{ $t('impactedIndividuals.temporary_address.edit.crc_provided_title') }}
          </div>
          <div class="pb-8">
            <v-radio-group
              v-model="form.crcProvided"
              row
              :disabled="lockCrcProvided"
              hide-details>
              <v-radio :label="$t('common.yes')" :value="true" data-test="CRC_provided_yes" />
              <v-radio :label="$t('common.no')" :value="false" data-test="CRC_provided_no" />
            </v-radio-group>
          </div>
        </template>
        <div v-if="form.hasCheckInCheckOut()" :class="{ 'py-3': compactView, 'py-4': !compactView }">
          <date-range
            id="currentAddressForm"
            :attach="true"
            :locale="$i18n.locale"
            :value="checkInCheckOutDate"
            :required="bookingMode && form.crcProvided"
            :disabled="extendStayMode || roomEditMode"
            background-color="white"
            display-format="MMM d, yyyy"
            :start-label="$t('impactedIndividuals.temporary_address.check_in') + (bookingMode && form.crcProvided ? ' *' : '')"
            :end-label="$t('impactedIndividuals.temporary_address.check_out') + (bookingMode && form.crcProvided ? ' *' : '')"
            @input="setCheckInCheckOut($event)" />
        </div>
      </v-col>
      <v-col
        v-if="showCrcProvidedAndCheckInCheckOut && extendStayMode"
        cols="12"
        sm="6"
        md="4">
        <date-range
          id="newCheckout"
          :attach="true"
          :locale="$i18n.locale"
          hide-start-date
          :value="newCheckOutDate"
          background-color="white"
          display-format="MMM d, yyyy"
          :end-label="$t('impactedIndividuals.temporary_address.new_check_out')"
          @input="setNewCheckOut($event)" />
      </v-col>

      <v-col v-if="form.hasStreet() && !extendStayMode && !roomEditMode" cols="12" :class="{ 'py-0': compactView }">
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
            :disabled="extendStayMode || roomEditMode"
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
            :disabled="extendStayMode || roomEditMode"
            return-object
            :data-test="`${prefixDataTest}__shelterLocation`"
            :label="`${$t('registration.addresses.temporaryAddressTypes.Shelter')} *`"
            :items="currentShelterLocations"
            @change="form.placeNumber = null" />
        </v-col>

        <v-col v-if="!form.isBookingRequest() && (form.hasPlaceNumber() || form.requiresShelterLocation())" cols="6" sm="3" md="4" :class="{ 'py-0': compactView }">
          <v-text-field-with-validation
            v-model="form.placeNumber"
            background-color="white"
            :disabled="extendStayMode"
            :rules="rules.placeNumber"
            :data-test="`${prefixDataTest}__placeNumber`"
            :label="placeNumberLabel" />
        </v-col>

        <v-col v-if="form.hasStreet()" cols="12" sm="9" md="8" :class="{ 'py-0': compactView }">
          <v-text-field-with-validation
            v-model="form.address.streetAddress"
            background-color="white"
            :disabled="extendStayMode || roomEditMode"
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
            :disabled="extendStayMode || roomEditMode"
            :rules="rules.unitSuite"
            :data-test="`${prefixDataTest}__unitSuite`"
            :label="$t('registration.addresses.unit')" />
        </v-col>
        <v-col v-else cols="6" sm="3" md="4" />

        <v-col v-if="form.requiresCity()" cols="12" sm="6" md="4" :class="{ 'py-0': compactView }">
          <v-text-field-with-validation
            v-model="form.address.city"
            background-color="white"
            :disabled="extendStayMode || roomEditMode"
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
            :disabled="extendStayMode || roomEditMode"
            :rules="rules.province"
            :data-test="`${prefixDataTest}__province`"
            :label="`${$t('registration.addresses.province')} *`"
            :items="canadianProvincesItems"
            @input="resetGeoLocation(form.address)" />
          <v-text-field-with-validation
            v-else
            v-model="form.address.specifiedOtherProvince"
            background-color="white"
            :disabled="extendStayMode || roomEditMode"
            :rules="rules.specifiedOtherProvince"
            :data-test="`${prefixDataTest}__specifiedOtherProvince`"
            :label="`${$t('registration.addresses.province')}*`"
            @input="resetGeoLocation(form.address)" />
        </v-col>

        <v-col v-if="form.hasPostalCode()" cols="6" sm="6" md="4" :class="{ 'py-0': compactView }">
          <v-text-field-with-validation
            v-model="form.address.postalCode"
            background-color="white"
            :disabled="extendStayMode || roomEditMode"
            :rules="rules.postalCode"
            :data-test="`${prefixDataTest}__postalCode`"
            :label="`${$t('registration.addresses.postalCode')}`"
            @input="resetGeoLocation(form.address)"
            @keyup="form.address.postalCode = form.address.postalCode ? form.address.postalCode.toUpperCase() : null" />
        </v-col>

        <v-col v-if="!form.crcProvided && form.requiresCountry()" cols="12" sm="6" md="8" :class="{ 'py-0': compactView }">
          <rc-country-select-with-validation
            v-model="form.address.country"
            background-color="white"
            :disabled="extendStayMode || roomEditMode"
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
import { addDays, parseISO, format } from 'date-fns';
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

    lockCrcProvided: {
      type: Boolean,
      default: false,
    },

    bookingMode: {
      type: Boolean,
      default: false,
    },

    extendStayMode: {
      type: Boolean,
      default: false,
    },

    roomEditMode: {
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
      newCheckOutDate: [] as string[],
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
          required: this.$hasFeature(this.$featureKeys.Lodging) && this.currentAddress.crcProvided,
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
      const required = (this.rules.placeNumber as any).required ? ' *' : '';
      switch (this.addressType) {
        case (ECurrentAddressTypes.Campground):
          return this.$t('registration.addresses.lotNumber') + required;
        case (ECurrentAddressTypes.HotelMotel):
        case (ECurrentAddressTypes.MedicalFacility):
          return this.$t('registration.addresses.roomNumber') + required;
        case (ECurrentAddressTypes.Shelter):
          return this.$t('registration.addresses.shelterLocationNumber') + required;
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
    if (this.extendStayMode) {
      const minDate = addDays(parseISO(this.form.checkOut as string), 1);
      this.newCheckOutDate = [format(minDate, 'yyyy-MM-dd'), null];
    }
  },

  methods: {
    changeType(type: ECurrentAddressTypes) {
      const bckCrcProvided = this.form.crcProvided;
      this.form.reset(type);
      (this.$refs.form as VForm).reset();
      this.checkInCheckOutDate = [null, null];

      if (this.lockCrcProvided) {
        this.form.crcProvided = bckCrcProvided;
      }
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

    setNewCheckOut(newCheckInCheckOut: string[]) {
      this.form.checkOut = newCheckInCheckOut[1];
      this.newCheckOutDate = [newCheckInCheckOut[0], newCheckInCheckOut[1]];
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
