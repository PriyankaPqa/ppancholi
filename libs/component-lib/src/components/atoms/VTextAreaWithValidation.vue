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
    preventMultipleNewLine: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    innerValue: '',
  }),
  watch: {
    // Handles internal model changes.
    innerValue(newVal) {
      if (this.preventMultipleNewLine) {
        this.$emit('input', this.removeMultipleLine(newVal));
      } else {
        this.$emit('input', newVal);
      }
    },
    // Handles external model changes.
    value(newVal) {
      if (this.preventMultipleNewLine) {
        this.innerValue = this.removeMultipleLine(newVal);
      } else {
        this.innerValue = newVal;
      }
    },
  },
  created() {
    if (this.value) {
      this.innerValue = this.value;
    }
  },
  methods: {
    removeMultipleLine(text) {
      // eslint-disable-next-line no-control-regex
      return text.replace(new RegExp('[\r\n]+', 'gm'), '\n');
    },
  },
};
</script>

<style scoped>
  ::v-deep .v-input__icon--clear {
    margin-top: -10px;
    padding-left: 20px;
  }
</style>
