<template>
  <validation-provider v-slot="{ errors, classes }" :name="$attrs.name" :rules="rules" :mode="mode">
    <rc-country-select
      v-model="selectedItem"
      outlined
      v-bind="$attrs"
      :class="classes"
      :error-messages="errors"
      :label="$attrs.label"
      v-on="$listeners" />
  </validation-provider>
</template>

<script>
import { ValidationProvider } from 'vee-validate';
import RcCountrySelect from '@libs/component-lib/components/atoms/RcCountrySelect/RcCountrySelect.vue';

export default {
  components: {
    RcCountrySelect,
    ValidationProvider,
  },
  props: {
    rules: {
      type: [Object, String],
      default: '',
    },
    value: {
      type: [String],
      default: null,
    },
    mode: {
      type: String,
      default: 'aggressive',
    },
  },
  data() {
    return {
      selectedItem: this.value,
    };
  },
  watch: {
    // Handles internal model changes.
    selectedItem(newVal) {
      this.$emit('input', newVal);
    },
    value(newVal) {
      this.selectedItem = newVal;
    },
  },
  created() {
    if (this.value) {
      this.selectedItem = this.value;
    }
  },
};
</script>
