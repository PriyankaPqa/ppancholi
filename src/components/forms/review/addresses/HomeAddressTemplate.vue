<template>
  <div class="rc-body14 pr-sm-3">
    <div class="rc-body14 fw-bold">
      {{ $t('registration.addresses.homeAddress') }}
    </div>
    <template v-if="!noHomeAddress">
      <div data-test="homeAddress__street">
        {{ address.streetAddress }} {{ address.unitSuite ? `#${address.unitSuite}`: '' }}
      </div>
      <div data-test="homeAddress__line">
        {{ address.city }}, {{ ECanadaProvinces[address.province] }}, {{ address.postalCode }}
      </div>
      <div data-test="homeAddress__country">
        {{ address.country }}
      </div>
    </template>
    <div v-else data-test="noFixedHomeAddress">
      {{ $t('registration.addresses.noFixedHomeAddress') }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IAddress } from '../../../../entities/beneficiary';
import { ECanadaProvinces } from '../../../../types';

export default Vue.extend({
  name: 'HomeAddressTemplate',
  props: {
    address: {
      type: Object as () => IAddress,
      required: true,
    },
  },
  data() {
    return {
      ECanadaProvinces,
    };
  },
  computed: {
    noHomeAddress(): boolean {
      return this.$storage.beneficiary.getters.beneficiary().noFixedHome;
    },
  },
});
</script>
