<template>
  <div class="status_red_pale border-radius-all pa-4">
    <div class="flex-row">
      <v-icon
        class="mr-3"
        color="black">
        mdi-alert
      </v-icon>

      <div class="rc-body14 fw-bold text--black">
        <slot name="default" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ErrorPanel',
});
</script>
