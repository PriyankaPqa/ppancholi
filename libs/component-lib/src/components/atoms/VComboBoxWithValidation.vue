<template>
  <validation-provider v-slot="{errors, classes}" :name="$attrs.name" :rules="rules" :mode="mode">
    <v-combobox
      v-model="innerValue"
      outlined
      :class="classes"
      :item-text="itemText"
      :item-value="itemValue"
      :return-object="returnObject"
      :error-messages="errors"
      v-bind="$attrs"
      onfocus="this.setAttribute('autocomplete','nope');"
      v-on="$listeners" />
  </validation-provider>
</template>

<script>
import { ValidationProvider } from 'vee-validate';

export default {
  components: {
    ValidationProvider,
  },
  props: {
    rules: {
      type: [Object, String],
      default: '',
    },
    value: {
      type: [String, Object, Array],
      default: null,
    },
    itemText: {
      type: [String, Function],
      default: 'text',
    },
    itemValue: {
      type: String,
      default: 'value',
    },
    mode: {
      type: String,
      default: 'aggressive',
    },

    /**
     * The return object prop from the v-autocomplete component
     */
    returnObject: {
      type: Boolean,
      default: false,
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
    if (this.value) {
      this.innerValue = this.value;
    }
  },
};
</script>
