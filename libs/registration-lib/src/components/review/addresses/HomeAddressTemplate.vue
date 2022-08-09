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
        {{ addressLine }}
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
import helpers from '@libs/entities-lib/helpers';
import { IAddress } from '@libs/entities-lib/household-create';
import { ECanadaProvinces } from '@libs/shared-lib/types';

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
      return this.$storage.registration.getters.householdCreate().noFixedHome;
    },

    addressLine(): string {
      const lines = helpers.getAddressLines(this.address, this.$i18n);
      if (lines[1]) {
        return helpers.getAddressLines(this.address, this.$i18n)[1];
      }
      return '';
    },
  },
});
</script>
