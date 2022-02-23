<template>
  <div class="rc-body14">
    <div v-if="!hideTitle" class="fw-bold">
      {{ $t('registration.addresses.currentAddress') }}
    </div>

    <div v-if="hasUnknownCurrentAddress" data-test="currentAddress__unknown">
      {{ $t('registration.addresses.temporaryAddressTypes.Unknown') }}
    </div>

    <div v-else-if="hasRemainingHomeCurrentAddress" data-test="currentAddress__remainingHome">
      {{ $t('registration.addresses.temporaryAddressTypes.RemainingInHome') }}
    </div>

    <div v-else-if="hasOtherCurrentAddress" data-test="currentAddress__other">
      {{ currentAddress.placeName }}
    </div>

    <template v-else>
      <div data-test="currentAddress__type">
        {{ $t(`registration.addresses.temporaryAddressTypes.${ECurrentAddressTypes[currentAddress.addressType]}`) }}
      </div>

      <div v-if="currentAddress.requiresPlaceName()" data-test="currentAddress__name">
        {{ currentAddress.placeName }}
        <span v-if="currentAddress.hasPlaceNumber() && currentAddress.placeNumber" data-test="currentAddress__placeNumber">
          {{ `#${currentAddress.placeNumber}` }}
        </span>
      </div>
      <div v-if="currentAddress.address" data-test="currentAddress__street">
        {{ currentAddress.address.streetAddress }}
        <span v-if="currentAddress.hasUnitSuite() && currentAddress.address.unitSuite">
          {{ `#${currentAddress.address.unitSuite}` }}
        </span>
      </div>
      <div data-test="currentAddress__line">
        {{ currentAddressLine }}
      </div>
      <div v-if="hasShelterCurrentAddress" data-test="currentAddress__shelterLocationName">
        {{ shelterLocationName }}
      </div>
      <div v-else data-test="currentAddress__country">
        {{ currentAddress.address.country }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import helpers from '@libs/registration-lib/ui/helpers';;
import { ECurrentAddressTypes, ICurrentAddress } from '../../../entities/value-objects/current-address';

export default Vue.extend({
  name: 'CurrentAddressTemplate',
  props: {
    currentAddress: {
      type: Object as () => ICurrentAddress,
      required: true,
    },

    hideTitle: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      ECurrentAddressTypes,
    };
  },
  computed: {
    shelterLocationName(): string {
      if (!this.currentAddress?.shelterLocation) {
        return '';
      }
      return this.$m(this.currentAddress.shelterLocation.name);
    },

    hasRemainingHomeCurrentAddress(): boolean {
      return this.currentAddress.addressType === ECurrentAddressTypes.RemainingInHome;
    },

    hasUnknownCurrentAddress(): boolean {
      return this.currentAddress.addressType === ECurrentAddressTypes.Unknown;
    },

    hasOtherCurrentAddress(): boolean {
      return this.currentAddress.addressType === ECurrentAddressTypes.Other;
    },

    hasShelterCurrentAddress(): boolean {
      return this.currentAddress.addressType === ECurrentAddressTypes.Shelter;
    },

    currentAddressLine(): string {
      const lines = helpers.getAddressLines(this.currentAddress.address, this.$i18n);
      if (lines[1]) {
        return helpers.getAddressLines(this.currentAddress.address, this.$i18n)[1];
      }
      return '';
    },
  },
});
</script>
