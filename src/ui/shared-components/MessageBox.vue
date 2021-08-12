<template>
  <v-container>
    <v-sheet rounded class="mb-3 pt-4" style="background-color: rgb(255 230 230);">
      <v-row>
        <v-col cols="1" class="d-flex justify-center">
          <v-icon
            class="ml-6"
            color="red">
            {{ icon }}
          </v-icon>
        </v-col>
        <v-col cols="10" style="text-align: justify;font-weight: bold;">
          {{ message }}
        </v-col>
      </v-row>
    </v-sheet>
  </v-container>
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
      required: true,
    },
  },
});
</script>

<style>

</style>
