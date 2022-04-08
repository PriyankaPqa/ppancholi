<template>
  <validation-provider v-slot="{ errors, classes }" :name="$attrs.name" :rules="rules" :mode="mode">
    <v-checkbox
      :input-value="innerValue"
      v-bind="$attrs"
      :class="classes"
      :error-messages="errors"
      :label="$attrs.label"
      type="checkbox"
      @change="innerValue = $event">
      <template #label>
        <slot name="label" />
      </template>
    </v-checkbox>
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
      type: [String, Object, Boolean],
      default: null,
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
