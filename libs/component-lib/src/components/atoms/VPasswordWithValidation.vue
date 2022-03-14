<template>
  <validation-provider v-slot="{ errors, classes }" :name="$attrs.name" :rules="rules" :mode="mode">
    <v-text-field
      v-model="innerValue"
      :class="classes"
      :type="showPassword ? 'text' : 'password'"
      :error-messages="errors"
      v-bind="$attrs"
      v-on="$listeners">
      <template #prepend>
        <slot name="prepend" />
      </template>
      <v-icon slot="append" data-test="append-icon" @click="showPassword = !showPassword">
        {{ appendIcon }}
      </v-icon>
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
  data() {
    return {
      innerValue: '',
      showPassword: false,
    };
  },
  computed: {
    appendIcon() {
      return this.showPassword ? 'visibility' : 'visibility_off';
    },
  },
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
