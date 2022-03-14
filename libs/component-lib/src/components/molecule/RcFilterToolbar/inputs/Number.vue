<template>
  <v-col
    cols="8"
    class="py-0 d-flex align-center">
    <v-container
      fluid
      class="pa-0">
      <v-row>
        <v-col
          class="py-0"
          cols="6">
          <v-text-field
            v-model="minValue"
            v-bind="filter.props"
            :data-test="`filterToolbar__input-${filter.key}-${filter.type}-min`"
            clearable
            outlined
            :label="filter.startLabel"
            :rules="[rules.minRequired]"
            type="number" />
        </v-col>

        <v-col
          class="py-0"
          cols="6">
          <v-text-field
            v-model="maxValue"
            v-bind="filter.props"
            :data-test="`filterToolbar__input-${filter.key}-${filter.type}-max`"
            clearable
            outlined
            :label="filter.endLabel"
            :rules="[rules.maxRequired, rules.maxGreaterThanMin]"
            type="number" />
        </v-col>
      </v-row>
    </v-container>
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue';
import _isArray from 'lodash/isArray';
import {
  IFilterSettings,
  IFilterToolbarLabels,
} from '@libs/component-lib/types';

export default Vue.extend({
  name: 'Number',

  props: {
    value: {
      type: [String, Array],
      required: true,
    },

    filter: {
      type: Object as () => IFilterSettings,
      required: true,
    },

    labels: {
      type: Object as () => IFilterToolbarLabels,
      default: null,
    },

    startLabel: {
      type: String,
      required: true,
    },

    endLabel: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      operator: '',
      minValue: '',
      maxValue: '',
    };
  },

  computed: {
    rules() {
      return {
        maxGreaterThanMin: (value: string) => {
          const max = parseFloat(value);
          const min = parseFloat(this.minValue);
          if (max <= min) {
            return this.labels.errors.maxGreaterThanMin;
          }

          return true;
        },

        minRequired: (value: string) => {
          if (typeof this.maxValue === 'number' || this.maxValue) {
            if (!value) {
              return this.labels.formRequiredField;
            }
          }

          return true;
        },

        maxRequired: (value: string) => {
          if (typeof this.minValue === 'number' || this.minValue) {
            if (!value) {
              return this.labels.formRequiredField;
            }
          }

          return true;
        },
      };
    },
  },

  watch: {
    minValue(newValue) {
      this.$emit('input', [newValue, this.maxValue]);
    },

    maxValue(newValue) {
      this.$emit('input', [this.minValue, newValue]);
    },
  },

  mounted() {
    if (this.value && _isArray(this.value)) {
      const [minValue, maxValue] = this.value as Array<string>;
      this.minValue = minValue;
      this.maxValue = maxValue;
    }
  },
});
</script>
