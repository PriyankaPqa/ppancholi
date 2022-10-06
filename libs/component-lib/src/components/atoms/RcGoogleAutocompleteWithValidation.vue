<template>
  <validation-provider v-slot="{ errors, classes }" :name="$attrs.name" :rules="rules" :mode="mode">
    <rc-google-autocomplete
      v-model="innerValue"
      outlined
      :disable-autocomplete="disableAutocomplete"
      :class="classes"
      :api-key="apiKey"
      :error-messages="errors"
      :prediction-types="predictionTypes"
      :min-length="minLength"
      :prediction-countries-restriction="predictionCountriesRestriction"
      v-bind="$attrs"
      v-on="$listeners" />
  </validation-provider>
</template>

<script>
import { ValidationProvider } from 'vee-validate';
import RcGoogleAutocomplete from '@libs/component-lib/components/atoms/RcGoogleAutocomplete.vue';

export default {
  components: {
    RcGoogleAutocomplete,
    ValidationProvider,
  },
  props: {
    apiKey: {
      type: String,
      required: true,
    },
    rules: {
      type: [Object, String],
      default: null,
    },
    // must be included in props
    value: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      default: 'aggressive',
    },
    disableAutocomplete: {
      type: Boolean,
      default: false,
    },
    predictionTypes: {
      type: Array,
      required: false,
      default: null,
    },
    predictionCountriesRestriction: {
      type: [Array, String],
      required: false,
      default: null,
    },

    minLength: {
      type: Number,
      default: 3,
    },
  },
  data: () => ({
    innerValue: '',
  }),
  watch: {
    // Handles internal model changes.
    innerValue(newVal) {
      this.$emit('input', newVal);
    },
    // Handles external model changes.
    value(newVal) {
      this.innerValue = newVal;
    },
  },
  created() {
    if (typeof this.value !== 'undefined' && this.value !== null) {
      this.innerValue = this.value;
    }
  },
};
</script>
