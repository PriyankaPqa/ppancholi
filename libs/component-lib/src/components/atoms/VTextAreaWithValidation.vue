<template>
  <validation-provider v-slot="{ errors, classes}" :name="$attrs.name" :rules="rules" :mode="mode">
    <v-textarea
      v-model="innerValue"
      outlined
      :class="classes"
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
    // must be included in props
    value: {
      type: String,
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
    if (this.value) {
      this.innerValue = this.value;
    }
  },
};
</script>

<style scoped>
  ::v-deep .v-input__icon--clear {
    margin-top: -10px;
    padding-left: 20px;
  }
</style>
