<template>
  <v-menu data-test="menu_status" :attach="true" :disabled="disabled">
    <template #activator="{ on }">
      <span v-on="setMenuAriaLabel(on)">
        <status-chip
          v-bind="$attrs"
          :class="{ pointer: !disabled, 'status-chip': true }"
          :disabled="disabled"
          :status="value"
          :status-name="statusName"
          :show-chevron="!disabled"
          data-test="statusSelect__chip" />
      </span>
    </template>
    <v-list :dense="true" width="300">
      <template v-for="status in statuses">
        <v-list-item
          :key="status"
          :class="{ selected: status === value }"
          :data-test="`statusSelect__${status}`"
          :disabled="status === value"
          @click="onChange(status)">
          <status-chip
            class="pointer"
            :status="status"
            :status-name="statusName" />
        </v-list-item>
        <v-divider :key="`divider_${status}`" />
      </template>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import helpers from '@libs/component-lib/helpers';

export default Vue.extend({
  name: 'StatusSelect',

  components: {
    StatusChip,
  },

  props: {
    value: {
      type: Number,
      required: true,
    },

    statusName: {
      type: String,
      required: true,
    },

    statuses: {
      type: Array as () => Array<number>,
      default: null,
    },

    disabled: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    onChange(status: number) {
      this.$emit('input', status);
    },

// needed in order to solve a11y issue Certain ARIA roles must contain particular children
    setMenuAriaLabel(on: any) {
      helpers.setElementA11yAttribute('.v-menu__content.theme--light.menuable__content__active', 'aria-busy', 'true');
      return on;
    },
  },
});
</script>

<style scoped lang="scss">
.status-chip {
  opacity: 1!important;
}

::v-deep .v-list-item--disabled {
  background-color: var(--v-primary-lighten2);
}

.disabled::v-deep.v-chip--clickable {
  cursor: initial!important;
}
</style>
