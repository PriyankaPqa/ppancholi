<template>
  <v-row no-gutters>
    <v-col cols="12" class="pb-0">
      <h5 class="rc-heading-5">
        {{ $t('registration.addresses.homeAddress') }}
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
        @change="setHomeAddress($event)" />
    </template>

    <current-address-form
      :shelter-locations="shelterLocations"
      :canadian-provinces-items="canadianProvincesItems"
      :current-address-type-items="currentAddressTypeItems"
      :api-key="apiKey"
      :current-address="currentAddress"
      :hide-remaining-home="noFixedHome"
      prefix-data-test="tempAddress"
      @change="setCurrentAddress($event)" />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { VCheckboxWithValidation } from '@crctech/component-library';

import VueI18n from 'vue-i18n';
import AddressForm from '../forms/AddressForm.vue';
import CurrentAddressForm from '../forms/CurrentAddressForm.vue';
import { EOptionItemStatus } from '../../types';
import helpers from '../../ui/helpers';
import { localStorageKeys } from '../../constants/localStorage';
import { IAddress } from '../../entities/value-objects/address';
import { ICurrentAddress, ECurrentAddressTypes, IShelterLocationData } from '../../entities/value-objects/current-address';

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
  },

  data() {
    return {
      apiKey: localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        ? localStorage.getItem(localStorageKeys.googleMapsAPIKey.name)
        : process.env.VUE_APP_GOOGLE_API_KEY,
    };
  },

  computed: {
    currentAddress(): ICurrentAddress {
      return this.$storage.household.getters.householdCreate().primaryBeneficiary.currentAddress;
    },

    homeAddress(): IAddress {
      return this.$storage.household.getters.householdCreate().homeAddress;
    },

    noFixedHome: {
      get(): boolean {
        return this.$storage.household.getters.householdCreate().noFixedHome;
      },
      set(checked: boolean) {
        this.$storage.household.mutations.setNoFixedHome(checked);
      },
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.getCanadianProvincesWithoutOther(this.i18n);
    },

    currentAddressTypeItems(): Record<string, unknown>[] {
      const list = helpers.enumToTranslatedCollection(ECurrentAddressTypes, 'registration.addresses.temporaryAddressTypes', this.i18n)
        .filter((item) => item.value !== ECurrentAddressTypes.RemainingInHome);

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
      this.$storage.household.mutations.setCurrentAddress(tmpAddress);
    },

    setHomeAddress(homeAddress: IAddress) {
      this.$storage.household.mutations.setHomeAddress(homeAddress);
    },
  },

});
</script>
