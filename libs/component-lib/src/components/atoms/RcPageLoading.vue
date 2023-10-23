<template>
  <div class="pageLoading">
    <div v-if="text" class="mb-16 text-center">
      <div class="pre-formatted">
        {{ text }}
      </div>
    </div>
    <v-progress-circular
      data-test="progress-circular"
      :color="color"
      indeterminate />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'RcPageLoading',

  props: {
    color: {
      type: String,
      default: 'primary',
    },
    text: {
      type: String,
      default: '',
    },
  },
});
</script>

<style lang="scss" scoped>
.pageLoading {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
