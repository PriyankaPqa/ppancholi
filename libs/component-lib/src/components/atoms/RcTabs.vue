<template>
  <div class="optionsList__tabContainer noselect">
    <slot name="default" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

/**
 * A simple component used to contain a set of RcTab components
 */
export default Vue.extend({
  name: 'RcTabs',
});
</script>

<style lang="scss" scoped>
.optionsList__tabContainer {
  background: white;
  border-bottom: 1px solid var(--v-grey-lighten2);
  display: flex;
  padding-left: 32px;
  margin-bottom: 16px;
}
</style>
