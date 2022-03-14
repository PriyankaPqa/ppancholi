<template>
  <div
    :key="country.iso2"
    :class="`countryList__item country__${country.iso2}`"
    :data-iso="country.iso2"
    @keydown.enter.stop="selectCountry(country)"
    @click="selectCountry(country)">
    <div :class="['vti__flag', country.iso2.toLowerCase()]" />

    <div class="listItem__country">
      {{ country.name }}
    </div>

    <div class="listItem__code caption">
      +{{ country.dialCode }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ICountry } from '../all-countries';
import '../../../styles/sprite.css';

export default Vue.extend({
  props: {
    country: {
      type: Object as () => ICountry,
      required: true,
    },
  },

  methods: {
    selectCountry(country: ICountry) {
      this.$emit('select-country', country);
    },
  },
});
</script>

<style scoped>
.countryList__item {
  background: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px;
  cursor: pointer;
}

.countryList__item--active {
  background: #f5f5f5;
}

.countryList__item:hover {
  background-color: #f5f5f5;
}

.vti__flag {
  margin-right: 5px;
  margin-left: 5px;
}

.listItem__country {
 flex: 1;
 padding-left: 8px;
}

.listItem__code {
  color: rgba(0, 0, 0, 0.54)
}
</style>
