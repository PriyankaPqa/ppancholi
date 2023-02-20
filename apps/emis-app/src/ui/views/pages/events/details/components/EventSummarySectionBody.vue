<template>
  <v-row class="no-gutters flex-column mt-0 px-2">
    <v-col
      v-for="(item, index) in items"
      :key="item.id"
      col="12"
      class="justify-end my-0 pa-4 event-section-item">
      <slot name="default" :item="item" :index="index" />
    </v-col>
    <slot name="toggleArea" />
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'EventSummarySectionBody',
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
});
</script>

<style scoped lang='scss'>
  .event-section-item {
    border: 1px solid var(--v-grey-lighten2);
    border-bottom: none;

    &:first-child {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
    &:last-child {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      border-bottom: 1px solid var(--v-grey-lighten2)  !important;
    }
  }

</style>
