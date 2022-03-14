<template>
  <button :class="{ 'optionsList__tab': true, active }" @click="$emit('click')">
    <span class="rc-body14 fw-bold">
      {{ label }}
    </span>
  </button>
</template>

<script lang="ts">
import Vue from 'vue';

/**
 * A single tab component, intended to be placed inside of the RcTabs component
 */
export default Vue.extend({
  name: 'RcTab',

  props: {
    /**
     * The label to show in the tab
     */
    label: {
      type: String,
      required: true,
    },

    /**
     * Whether or not this tab is currently active
     */
    active: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.optionsList__tab {
  background: var(--v-grey-lighten5);
  border-top: 4px solid transparent;
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  padding: 12px 32px;
  cursor: pointer;
}

.optionsList__tab:focus {
  outline-style: auto;
  outline-color: var(--v-primary-base);
}

.optionsList__tab.active {
  background: var(--v-white-base);
  border-top: 4px solid var(--v-secondary-base);
  border-left: 1px solid var(--v-grey-lighten2);
  border-right: 1px solid var(--v-grey-lighten2);
  transform: translateY(1px);

  div {
    transform: translateY(-1px);
  }
}
</style>
