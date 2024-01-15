<template>
  <v-data-table-a11y
    :value="value"
    class="border-radius-bottom"
    v-bind="$attrs"
    :items="items"
    :server-items-length="Math.max(count, items.length)"
    :headers="headers"
    :disable-filtering="true"
    :must-sort="true"
    :options="options"
    @update:options="$emit('update:options', $event)"
    @click:row="$emit('click:row', $event)"
    @input="$emit('input', $event)">
    <template #no-data>
      <slot name="no-data" />
    </template>
    <template #expanded-item="data">
      <slot name="expanded-item" v-bind="data" />
    </template>
    <template
      v-for="col in customColumns"
      #[`item.${col}`]="data">
      <slot
        :name="`item.${col}`"
        v-bind="data" />
    </template>
  </v-data-table-a11y>
</template>

<script lang="ts">
import Vue from 'vue';
import VDataTableA11y from '../../../atoms/VDataTableA11y.vue';

export default Vue.extend({
  name: 'RcDataTableBody',

  components: {
    VDataTableA11y,
  },

  props: {
    value: {
      type: Array,
      default: () => [] as unknown[],
    },

    items: {
      type: Array,
      default: () => [] as Record<string, unknown>[],
    },

    headers: {
      type: Array,
      required: true,
    },

    count: {
      type: Number,
      default: 0,
    },

    options: {
      type: Object,
      default: () => ({}),
    },

    customColumns: {
      type: Array,
      default: () => [] as string[],
    },
  },
});
</script>

<style scoped lang="scss">
::v-deep .v-data-table__checkbox i.mdi-checkbox-marked, ::v-deep .v-data-table__checkbox i.mdi-minus-box {
  color: var(--v-primary-base);
}

::v-deep .v-data-table__selected {
  background: var(--v-primary-lighten2)!important;
}

::v-deep .v-data-table__empty-wrapper {
    color: var(--v-grey-darken2) !important;
  }
</style>
