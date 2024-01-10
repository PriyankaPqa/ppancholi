<template>
  <v-row class="hp">
    <v-col cols="12" sm="6">
      <v-text-field
        :name="fieldName"
        :label="`${labelName}*`"
        autocomplete="off"
        tabindex="-1"
        @change="$emit('change', $event)" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';

/** *******
 * a honey pot is meant to capture bots
 * the name emitted here should be sent to the backend and they
 * should ignore the request if that field is filled
 * it is meant to be on the page but invisible to users
 * ************ */

export default Vue.extend({
  name: 'HoneyPot',

  props: {
    fieldName: {
      type: String,
      default: 'name',
    },
    labelName: {
      type: String,
      default: 'Name',
    },
  },
});
</script>
<style>
    .hp{
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        height: 0;
        width: 0;
        z-index: -1;
    }
</style>
