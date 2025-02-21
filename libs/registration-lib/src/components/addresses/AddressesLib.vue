<template>
  <v-row no-gutters class="d-flex flex-column">
    <template v-if="showHomeAddress">
      <v-col v-if="showCurrentAddress" cols="12" class="pb-0">
        <div class="rc-heading-5">
          {{ $t('registration.addresses.homeAddress') }}
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn small class="ml-1" icon :aria-label="$t('tooltip.home_address')" data-test="pageContent__opeHelp" v-on="on">
                <v-icon small>
                  mdi-help-circle-outline
                </v-icon>
              </v-btn>
            </template>
            <span>{{ $t('tooltip.home_address') }}</span>
          </v-tooltip>
        </div>
      </v-col>
      <v-col cols="12" class="pb-6">
        <v-row no-gutters>
          <v-checkbox-with-validation
            v-model="noFixedHome"
            data-test="address__noFixedHomeAddress"
            :label="`${$t('registration.addresses.noFixedHomeAddress')}`" />
        </v-row>
      </v-col>

      <template v-if="!noFixedHome">
        <address-form
          :api-key="apiKey"
          :canadian-provinces-items="canadianProvincesItems"
          prefix-data-test="address"
          :home-address="homeAddress"
          :disable-autocomplete="disableAutocomplete"
          :is-edit-mode="isEditMode"
          @change="setHomeAddress($event)" />
      </template>
    </template>
    <template v-if="showCurrentAddress">
      <validation-observer ref="currentAddress" slim>
        <current-address-form
          :hide-title="!showHomeAddress"
          :shelter-locations="shelterLocations"
          :canadian-provinces-items="canadianProvincesItems"
          :current-address-type-items="currentAddressTypeItems"
          :api-key="apiKey"
          :current-address="currentAddress"
          :no-fixed-home="noFixedHome"
          :disable-autocomplete="disableAutocomplete"
          prefix-data-test="tempAddress"
          @change="setCurrentAddress($event)" />
      </validation-observer>
    </template>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { VCheckboxWithValidation } from '@libs/component-lib/components';
import helpers from '@libs/entities-lib/helpers';
import { Address, IAddress } from '@libs/entities-lib/value-objects/address';
import { ICurrentAddress } from '@libs/entities-lib/value-objects/current-address';
import { useAddresses } from '@libs/registration-lib/components/forms/mixins/useAddresses';
import { EEventLocationStatus, IEventGenericLocation } from '@libs/entities-lib/event';
import AddressForm from '../forms/AddressForm.vue';
import CurrentAddressForm from '../forms/CurrentAddressForm.vue';
import { localStorageKeys } from '../../constants/localStorage';

export default Vue.extend({
  name: 'AddressesLib',

  components: {
    VCheckboxWithValidation,
    AddressForm,
    CurrentAddressForm,
  },

  props: {
    disableAutocomplete: {
      type: Boolean,
      required: true,
    },

    isEditMode: {
      type: Boolean,
      default: false,
    },

    showCurrentAddress: {
      type: Boolean,
      default: true,
    },

    showHomeAddress: {
      type: Boolean,
      default: true,
    },
  },

  setup() {
    const { getCurrentAddressTypeItems } = useAddresses();
    return { getCurrentAddressTypeItems };
  },

  data() {
    return {
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VITE_GOOGLE_API_KEY,
      emptyAddress: {
        country: 'CA',
        streetAddress: '',
        unitSuite: null,
        province: null,
        specifiedOtherProvince: '',
        city: '',
        postalCode: '',
        latitude: 0,
        longitude: 0,
      },
    };
  },

  computed: {
    currentAddress(): ICurrentAddress {
      return this.$registrationStore.getHouseholdCreate().primaryBeneficiary.currentAddress;
    },

    homeAddress(): IAddress {
      return this.$registrationStore.getHouseholdCreate().homeAddress;
    },

    noFixedHome: {
      get(): boolean {
        return this.$registrationStore.getHouseholdCreate().noFixedHome;
      },
      async set(checked: boolean) {
        this.$registrationStore.householdCreate.noFixedHome = checked;
        if (checked) {
          this.setHomeAddress(new Address(this.emptyAddress));
        }
      },
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.getCanadianProvincesWithoutOther(this.$i18n);
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      return this.getCurrentAddressTypeItems(this.$i18n, this.noFixedHome, !!this.shelterLocations.length, false);
    },

    shelterLocations(): IEventGenericLocation[] {
      const event = this.$registrationStore.getEvent();
      if (event.shelterLocations) {
        const locations = event.shelterLocations.filter((s) => s.status === EEventLocationStatus.Active);
        if (this.currentAddress.shelterLocation) {
          return [this.currentAddress.shelterLocation, ...locations];
        }
        return locations;
      }
      return [];
    },
  },

  methods: {
    setCurrentAddress(tmpAddress: ICurrentAddress) {
      this.$registrationStore.householdCreate.setCurrentAddress(tmpAddress);
    },

    setHomeAddress(homeAddress: IAddress) {
      this.$registrationStore.householdCreate.setHomeAddress(homeAddress);
    },
  },

});
</script>
