<template>
  <v-text-field-with-validation
    v-model="innerValue"
    :data-test="dataTest"
    type="number"
    dense
    background-color="white"
    v-bind="$attrs"
    :rules="rules"
    :label="label"
    @blur="round" />
</template>

<script lang="ts">
import Vue from 'vue';
import VTextFieldWithValidation from './VTextFieldWithValidation.vue';

export default Vue.extend({
  name: 'ItemAmount',

  components: {
    VTextFieldWithValidation,
  },

  props: {
    dataTest: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
    rules: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    innerValue: 0,
  }),

  watch: {
    innerValue(newVal) {
      this.$emit('input', newVal);
    },
    value(newVal) {
      this.innerValue = newVal;
    },
  },

  created() {
    this.innerValue = this.value as number;
  },

  methods: {
    round() {
      const vNum = Number(this.innerValue);

      if (Number.isNaN(vNum)) {
        return;
      }

      this.innerValue = Math.round(vNum * 100) / 100;
    },
  },
});
</script>
