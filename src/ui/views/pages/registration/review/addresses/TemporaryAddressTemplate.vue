<template>
  <div class="rc-body14">
    <div class="fw-bold">
      {{ $t('registration.addresses.temporaryAddress') }}
    </div>

    <div v-if="hasUnknownTemporaryAddress" data-test="temporaryAddress__unknown">
      {{ $t('registration.addresses.temporaryAddressTypes.Unknown') }}
    </div>

    <div v-else-if="hasRemainingHomeTemporaryAddress" data-test="temporaryAddress__remainingHome">
      {{ $t('registration.addresses.temporaryAddressTypes.RemainingInHome') }}
    </div>

    <div v-else-if="hasOtherTemporaryAddress" data-test="temporaryAddress__other">
      {{ address.placeName }}
    </div>

    <template v-else>
      <div data-test="temporaryAddress__type">
        {{ $t(`registration.addresses.temporaryAddressTypes.${ETemporaryAddressTypes[address.temporaryAddressType]}`) }}
      </div>

      <div v-if="address.requiresPlaceName()" data-test="temporaryAddress__name">
        {{ address.placeName }}
        <span v-if="address.hasPlaceNumber() && address.placeNumber" data-test="temporaryAddress__placeNumber">
          {{ `#${address.placeNumber}` }}
        </span>
      </div>
      <div data-test="temporaryAddress__street">
        {{ address.street }}
        <span v-if="address.hasUnitSuite() && address.unitSuite">
          {{ `#${address.unitSuite}` }}
        </span>
      </div>
      <div data-test="temporaryAddress__line">
        {{ temporaryAddressLine }}
      </div>
      <div v-if="address.temporaryAddressType === ETemporaryAddressTypes.Shelter" data-test="temporaryAddress__shelterLocationName">
        {{ getShelterLocationName }}
      </div>
      <div v-else data-test="temporaryAddress__country">
        {{ address.country }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { ETemporaryAddressTypes, ITemporaryAddress } from '@crctech/registration-lib/src/entities/value-objects/temporary-address';
import Vue from 'vue';
import { ECanadaProvinces } from '@/types';

export default Vue.extend({
  name: 'TemporaryAddressTemplate',
  props: {
    address: {
      type: Object as () => ITemporaryAddress,
      required: true,
    },
  },
  data() {
    return {
      ETemporaryAddressTypes,
    };
  },
  computed: {

    getShelterLocationName(): string {
      return 'TO DO SHELTER NAME';
    },

    hasRemainingHomeTemporaryAddress(): boolean {
      return this.address.temporaryAddressType === ETemporaryAddressTypes.RemainingInHome;
    },

    hasUnknownTemporaryAddress(): boolean {
      return this.address.temporaryAddressType === ETemporaryAddressTypes.Unknown;
    },

    hasOtherTemporaryAddress(): boolean {
      return this.address.temporaryAddressType === ETemporaryAddressTypes.Other;
    },

    temporaryAddressLine(): string {
      if (!this.address) {
        return '';
      }
      const line = [];
      if (this.address.city) {
        line.push(this.address.city);
      }
      if (this.address.provinceTerritory) {
        line.push(ECanadaProvinces[this.address.provinceTerritory as number]);
      }
      if (this.address.postalCode) {
        line.push(this.address.postalCode);
      }
      return line.join(', ');
    },
  },
});
</script>
