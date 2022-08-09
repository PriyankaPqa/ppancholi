<template>
  <v-autocomplete
    v-model="innerValue"
    autocomplete="off"
    :attach="attach"
    v-bind="$attrs"
    :items="countries"
    v-on="{
      ...$listeners,
      input: onInput
    }">
    <template #selection="{item}">
      <div
        v-if="innerValue"
        :class="[
          'flag',
          'vti__flag',
          innerValue.toLowerCase(),
        ]" />
      <div
        class="ml-2"
        data-test="selection">
        {{ item.text }}
      </div>
    </template>

    <template #item="{ item }">
      <v-list-item-icon class="mr-2">
        <div
          :class="[
            'mt-1',
            'vti__flag',
            item.value.toLowerCase(),
          ]" />
      </v-list-item-icon>

      <v-list-item-content>
        <v-list-item-title :data-test="item.value">
          {{ item.text }}
        </v-list-item-title>
      </v-list-item-content>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import Vue from 'vue';
import '../../styles/sprite.css';
import { en, fr } from '../../../../../shared-lib/src/constants/countries';

/**
 * A country select built using v-autocomplete. Uses iso2 country names and codes.
 *
 * * Implements all props for **v-autocomplete**: https://vuetifyjs.com/en/components/autocompletes
 */
export default Vue.extend({
  name: 'RcCountrySelect',

  props: {
    /**
     * The default value
     */
    value: {
      type: String,
      default: '',
    },
    /**
     * The current language to display the countries in
     */
    language: {
      type: String,
      default: 'en',
    },

    attach: {
      type: [String, Boolean, Object],
      default: true,
    },
  },

  data() {
    return {
      innerValue: this.value,
      countriesData: {
        en,
        fr,
      } as Record<string, Record<string, string>>,
    };
  },

  computed: {
    countries(): { value: string; text: string }[] {
      const countryNames = this.countriesData[this.language];
      const countryOptions = Object.keys(countryNames)
        .map((key) => ({ value: key, text: countryNames[key] }))
        .sort((a, b) => a.text.localeCompare(b.text));

      return countryOptions;
    },
  },

  watch: {
    value() {
      this.innerValue = this.value;
    },

  },

  methods: {
    onInput(input: string) {
      this.$emit('input', input);
    },
  },
});
</script>

<style scoped lang="scss">
.flag {
  width: 20px;
}
</style>
