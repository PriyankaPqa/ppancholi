<template>
  <v-tooltip v-bind="$attrs" max-width="350" right>
    <template #activator="{ on, attrs }">
      <v-icon v-bind="attrs" :class="className" small v-on="on">
        mdi-help-circle-outline
      </v-icon>
    </template>

    <span>
      {{ label }}
    </span>
  </v-tooltip>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TooltipFinancialAssistanceCategory',

  props: {
    label: {
      type: String,
      required: true,
    },

    className: {
      type: [String, Object],
      default: '',
    },
  },
});
</script>
