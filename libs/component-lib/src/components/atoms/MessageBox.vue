<template>
  <v-sheet rounded class="mb-3 pa-4" :style="styles">
    <div class="d-flex align-start pl-1" style="text-align: justify;font-weight: bold;">
      <v-icon
        class="pr-3"
        :small="smallIcon"
        :color="iconColor">
        {{ icon }}
      </v-icon>
      {{ message }}
      <slot name="default" />
    </div>
  </v-sheet>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'MessageBox',

  props: {
    icon: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      default: '',
    },

    styles: {
      type: Object as () => Record<string, string>,
      default() {
        return { 'background-color': 'rgb(255 230 230)' };
      },
    },

    iconColor: {
      type: String,
      default() {
        return 'red';
      },
    },

    smallIcon: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style>

</style>
