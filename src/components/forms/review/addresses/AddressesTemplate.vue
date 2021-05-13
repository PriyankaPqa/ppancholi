<template>
  <div class="addresses-container">
    <div class="address">
      <home-address-template :address="beneficiary.homeAddress" />
    </div>
    <div class="address">
      <temporary-address-template :address="beneficiary.person.temporaryAddress" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IBeneficiary } from '../../../../entities/beneficiary';
import HomeAddressTemplate from './HomeAddressTemplate.vue';
import TemporaryAddressTemplate from './TemporaryAddressTemplate.vue';

export default Vue.extend({
  name: 'AddressesTemplate',
  components: {
    HomeAddressTemplate,
    TemporaryAddressTemplate,
  },
  props: {
    beneficiary: {
      type: Object as () => IBeneficiary,
      required: true,
    },
  },
});
</script>

<style scoped lang="scss">
@import "src/styles/breakpoints";

@media only screen and (min-width: $breakpoint-xs-min) and (max-width: $breakpoint-xs-max) {
  .address {
    border: solid 1px var(--v-grey-lighten2);
    justify-items: center;
    align-items: baseline;
    padding: 16px;
    width: 100%;
    &:first-child {
      border-radius: 4px 4px 0px 0px;
    }
    &:last-child {
      border-top-width: 0px;
      border-radius: 0px 0px 4px 4px;
    }
  }
}
@media only screen and (min-width: $breakpoint-sm-min) {
  .addresses-container {
    border: solid 1px var(--v-grey-lighten2);
    border-radius: 4px;
    display: flex;
    justify-items: center;
    align-items: baseline;
    padding: 16px;
    width: 100%;
    & > .address {
      display: flex;
      width: 100%;
      flex-direction: column;
      justify-content: space-evenly;
    }
  }
}
</style>
