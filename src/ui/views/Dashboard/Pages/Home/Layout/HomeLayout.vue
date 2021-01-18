<template>
  <v-btn @click="get">
    Get
  </v-btn>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'HomeLayout',
  methods: {
    get() {
      this.$services.events.getEventTypes();
    },
  },
});
</script>
