<template>
  <validation-provider v-slot="{ errors, classes }" :name="$attrs.name" :rules="rules" :mode="mode">
    <v-checkbox
      ref="vCheckbox"
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

<script lang="ts">
import { ValidationProvider } from 'vee-validate';
import Vue from 'vue';
import helpers from '@libs/component-lib/helpers';

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
  async mounted() {
    await this.setA11yAttribute();
  },
  methods: {
    // needed in order to set a11y attribute aria-controls properly
    // this issue only occurs in VCheckboxWithValidation, the normal VCheckbox works correctly
    setA11yAttribute() {
      setTimeout(() => {
      const controlsId = (this.$refs.vCheckbox as Vue)?.$el.querySelector('input')?.id;
        if (controlsId) {
          helpers.setElementA11yAttribute('.v-input__slot > .v-input--selection-controls__input', 'aria-controls', controlsId, (this.$refs.vCheckbox as Vue)?.$el);
        }
      }, 0);
    },
  },
};
</script>
