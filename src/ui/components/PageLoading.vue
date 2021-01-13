<template>
  <div class="pageLoading">
    <v-progress-circular
      :color="color"
      indeterminate />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'PageLoading',

  props: {
    color: {
      type: String,
      default: 'primary',
    },
  },
});
</script>

<style lang="scss" scoped>
.pageLoading {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
