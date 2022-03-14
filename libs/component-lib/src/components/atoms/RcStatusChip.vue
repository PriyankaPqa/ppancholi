<template>
  <v-chip ref="vchip" v-bind="$attrs" :color="color" :text-color="textColor" small>
    <slot name="default" />
  </v-chip>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'RcStatusChip',

  props: {
    color: {
      type: String,
      required: true,
    },

    textColor: {
      type: String,
      required: true,
    },
  },
});
</script>
