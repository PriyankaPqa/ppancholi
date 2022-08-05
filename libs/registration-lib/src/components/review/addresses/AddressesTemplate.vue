<template>
  <div class="addresses-container">
    <div class="address">
      <home-address-template :address="household.homeAddress" />
    </div>
    <div class="address">
      <current-address-template :current-address="household.primaryBeneficiary.currentAddress" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IHouseholdCreate } from '@libs/entities-lib/household-create';
import HomeAddressTemplate from './HomeAddressTemplate.vue';
import CurrentAddressTemplate from './CurrentAddressTemplate.vue';

export default Vue.extend({
  name: 'AddressesTemplate',
  components: {
    HomeAddressTemplate,
    CurrentAddressTemplate,
  },
  props: {
    household: {
      type: Object as () => IHouseholdCreate,
      required: true,
    },
  },
});
</script>

<style scoped lang="scss">
@import "../../libs/assets/styles/breakpoints";

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
