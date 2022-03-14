<template>
  <v-tooltip :color="color" :open-delay="openDelay" v-bind="$attrs" :data-test="$attrs['data-test']">
    <template #default>
      <slot name="default" />
    </template>

    <template #activator="{ on, value }">
      <slot name="activator" :on="on" :value="value" />
    </template>
  </v-tooltip>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'RcTooltip',

  props: {
    color: {
      type: String,
      default: 'grey darken-4',
    },
    openDelay: {
      type: Number,
      default: 300,
    },
  },
});
</script>

<style lang="scss" scoped>
.v-tooltip__content {
  padding: 8px 12px;
  line-height: 16px;
  opacity: 1 !important;
}
</style>
