<template>
  <v-row no-gutters class="d-flex flex-column">
    <v-col cols="12" class="pb-0">
      <h5 class="rc-heading-5">
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
      </h5>
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
        @change="setHomeAddress($event)" />
    </template>

    <validation-observer ref="currentAddress" slim>
      <current-address-form
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
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { VCheckboxWithValidation } from '@libs/component-lib/components';

import VueI18n from 'vue-i18n';
import helpers from '@libs/entities-lib/helpers';
import { EOptionItemStatus } from '@libs/shared-lib/types';
import { Address, IAddress } from '@libs/entities-lib/value-objects/address';
import {
  ICurrentAddress,
  ECurrentAddressTypes,
  IShelterLocationData,
} from '@libs/entities-lib/value-objects/current-address';
import AddressForm from '../forms/AddressForm.vue';
import CurrentAddressForm from '../forms/CurrentAddressForm.vue';
import { localStorageKeys } from '../../constants/localStorage';

export default Vue.extend({
  name: 'Addresses',

  components: {
    VCheckboxWithValidation,
    AddressForm,
    CurrentAddressForm,
  },

  props: {
    i18n: {
      type: Object as () => VueI18n,
      required: true,
    },

    disableAutocomplete: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VUE_APP_GOOGLE_API_KEY,
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
      return this.$storage.registration.getters.householdCreate().primaryBeneficiary.currentAddress;
    },

    homeAddress(): IAddress {
      return this.$storage.registration.getters.householdCreate().homeAddress;
    },

    noFixedHome: {
      get(): boolean {
        return this.$storage.registration.getters.householdCreate().noFixedHome;
      },
      async set(checked: boolean) {
        this.$storage.registration.mutations.setNoFixedHome(checked);
        if (checked) {
          this.setHomeAddress(new Address(this.emptyAddress));
        }
      },
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.getCanadianProvincesWithoutOther(this.i18n);
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      let list = helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes', this.i18n)
        .filter((item) => (item.value !== ECurrentAddressTypes.RemainingInHome));

      if (this.shelterLocations.length === 0) {
        list = list.filter((item) => (item.value !== ECurrentAddressTypes.Shelter));
      }

      if (this.noFixedHome) {
        return list;
      }
      return [
        {
          value: ECurrentAddressTypes.RemainingInHome,
          text: this.i18n.t('registration.addresses.temporaryAddressTypes.RemainingInHome').toString(),
        },
        ...list,
      ];
    },

    shelterLocations(): IShelterLocationData[] {
      const event = this.$storage.registration.getters.event();
      if (event) {
        return event.shelterLocations.filter((s: IShelterLocationData) => s.status === EOptionItemStatus.Active);
      }
      return [];
    },
  },

  methods: {
    setCurrentAddress(tmpAddress: ICurrentAddress) {
      this.$storage.registration.mutations.setCurrentAddress(tmpAddress);
    },

    setHomeAddress(homeAddress: IAddress) {
      this.$storage.registration.mutations.setHomeAddress(homeAddress);
    },
  },

});
</script>
