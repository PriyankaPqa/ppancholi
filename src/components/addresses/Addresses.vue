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

    <temp-address-form
      :shelter-locations="shelterLocations"
      :canadian-provinces-items="canadianProvincesItems"
      :temporary-address-type-items="temporaryAddressTypeItems"
      :api-key="apiKey"
      :temporary-address="temporaryAddress"
      :hide-remaining-home="noFixedHome"
      prefix-data-test="tempAddress"
      @change="setTemporaryAddress($event)" />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { VCheckboxWithValidation } from '@crctech/component-library';

import VueI18n from 'vue-i18n';
import AddressForm from '../forms/AddressForm.vue';
import TempAddressForm from '../forms/TempAddressForm.vue';
import { ECanadaProvinces, EOptionItemStatus } from '../../types';
import helpers from '../../ui/helpers';
import { localStorageKeys } from '../../constants/localStorage';
import { IAddress } from '../../entities/value-objects/address';
import { IShelterLocation } from '../../entities/event';
import { ITemporaryAddress, ETemporaryAddressTypes } from '../../entities/value-objects/temporary-address';

export default Vue.extend({
  name: 'Addresses',

  components: {
    VCheckboxWithValidation,
    AddressForm,
    TempAddressForm,
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
    temporaryAddress(): ITemporaryAddress {
      return this.$storage.beneficiary.getters.beneficiary().person.temporaryAddress;
    },

    homeAddress(): IAddress {
      return this.$storage.beneficiary.getters.beneficiary().homeAddress;
    },

    noFixedHome: {
      get(): boolean {
        return this.$store.state.beneficiary.noFixedHome;
      },
      set(checked: boolean) {
        this.$storage.beneficiary.mutations.setNoFixedHome(checked);
      },
    },

    canadianProvincesItems(): Record<string, unknown>[] {
      return helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces', this.i18n);
    },

    temporaryAddressTypeItems(): Record<string, unknown>[] {
      const list = helpers.enumToTranslatedCollection(ETemporaryAddressTypes, 'registration.addresses.temporaryAddressTypes', this.i18n)
        .filter((item) => item.value !== ETemporaryAddressTypes.RemainingInHome);

      if (this.noFixedHome) {
        return list;
      }
      return [
        {
          value: ETemporaryAddressTypes.RemainingInHome,
          text: this.i18n.t('registration.addresses.temporaryAddressTypes.RemainingInHome').toString(),
        },
        ...list,
      ];
    },

    shelterLocations(): IShelterLocation[] {
      const event = this.$storage.registration.getters.event();
      if (event) {
        return event.shelterLocations.filter((s: IShelterLocation) => s.status === EOptionItemStatus.Active);
      }
      return [];
    },
  },

  methods: {
    setTemporaryAddress(tmpAddress: ITemporaryAddress) {
      this.$storage.beneficiary.mutations.setTemporaryAddress(tmpAddress);
    },

    setHomeAddress(homeAddress: IAddress) {
      this.$storage.beneficiary.mutations.setHomeAddress(homeAddress);
    },
  },

});
</script>
