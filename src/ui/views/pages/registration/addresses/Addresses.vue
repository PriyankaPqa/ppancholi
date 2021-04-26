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
import { TempAddressForm, AddressForm } from '@crctech/registration-lib';

import { ITemporaryAddress, ETemporaryAddressTypes } from '@crctech/registration-lib/src/entities/value-objects/temporary-address';
import { enumToTranslatedCollection } from '@/ui/utils';
import { ECanadaProvinces, EOptionItemStatus } from '@/types';
import { IAddress } from '@crctech/registration-lib/src/entities/value-objects/address';
import { localStorageKeys } from '@/constants/localStorage';
import { IShelterLocation } from '@crctech/registration-lib/src/entities/event';

export default Vue.extend({
  name: 'Addresses',

  components: {
    VCheckboxWithValidation,
    AddressForm,
    TempAddressForm,
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
      return enumToTranslatedCollection(ECanadaProvinces, 'common.provinces');
    },

    temporaryAddressTypeItems(): Record<string, unknown>[] {
      const list = enumToTranslatedCollection(ETemporaryAddressTypes, 'registration.addresses.temporaryAddressTypes');
      if (this.noFixedHome) {
        return list.filter((item) => item.value !== ETemporaryAddressTypes.RemainingInHome);
      }
      return list;
    },

    shelterLocations():IShelterLocation[] {
      const event = this.$storage.registration.getters.event();
      if (event) {
        return event.shelterLocations.filter((s) => s.status === EOptionItemStatus.Active);
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
