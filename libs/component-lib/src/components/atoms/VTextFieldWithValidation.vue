<template>
  <validation-provider v-slot="{ errors, classes }" :name="$attrs.name" :rules="rules" :mode="mode">
    <v-text-field
      v-model="innerValue"
      outlined
      :class="classes"
      :error-messages="errors"
      v-bind="$attrs"
      onfocus="this.setAttribute('autocomplete','nope');"
      v-on="$listeners">
      <template #prepend>
        <slot name="prepend" />
      </template>

      <template #append>
        <slot name="append" />
      </template>
    </v-text-field>
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
      default: null,
    },
    // must be included in props
    value: {
      type: [String, Number],
      default: '',
    },
    mode: {
      type: String,
      default: 'aggressive',
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
