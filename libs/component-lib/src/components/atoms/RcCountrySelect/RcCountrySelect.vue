<template>
  <v-autocomplete-a11y
    v-model="innerValue"
    autocomplete="off"
    :attach="attach"
    v-bind="$attrs"
    :items="countries"
    v-on="{
      ...$listeners,
      input: onInput,
    }">
    <template #selection="{ item }">
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
  </v-autocomplete-a11y>
</template>

<script lang="ts">
import Vue from 'vue';
import '../../styles/sprite.css';
import en from '@libs/shared-lib/constants/countries/en';
import fr from '@libs/shared-lib/constants/countries/fr';
import VAutocompleteA11y from '../VAutocompleteA11y.vue';

/**
 * A country select built using v-autocomplete. Uses iso2 country names and codes.
 *
 * * Implements all props for **v-autocomplete**: https://vuetifyjs.com/en/components/autocompletes
 */
export default Vue.extend({
  name: 'RcCountrySelect',

  components: {
    VAutocompleteA11y,
  },

  props: {
    /**
     * The default value
     */
    value: {
      type: String,
      default: '',
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
      const countryNames = this.countriesData[this.$i18n?.locale === 'fr' ? 'fr' : 'en'];
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
