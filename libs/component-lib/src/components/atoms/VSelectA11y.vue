<template>
  <v-select
    ref="vSelectA11y"
    v-model="selectedItem"
    v-bind="$attrs"
    :aria-label="ariaLabel"
    v-on="$listeners"
    @keydown="setMenuA11y"
    @click="setMenuA11y">
    <!-- Pass on all named slots -->
    <slot v-for="slot in Object.keys($slots)" :slot="slot" :name="slot" />

    <!-- Pass on all scoped slots -->
    <template v-for="slot in Object.keys($scopedSlots)" :slot="slot" slot-scope="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </v-select>
</template>

<script lang="ts">
import Vue from 'vue';
import helpers from '@libs/component-lib/helpers';

export default {
  name: 'VSelectA11y',
  props: {
    /**
     * The selected value(s) of the dropdown
     */
    value: {
      type: [Object, Array, String, Number],
      default: () => [] as unknown[],
    },

    ariaLabel: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      selectedItem: this.value,
    };
  },

  mounted() {
    helpers.setElementA11yAttribute('.v-input__slot', 'role', 'combobox', (this.$refs.vSelectA11y as Vue)?.$el);
  },

  methods: {
    setMenuA11y() {
      setTimeout(() => {
        const menuId = document.querySelector('.v-menu__content.menuable__content__active .v-list.v-select-list')?.id;

        if (menuId) {
          helpers.setElementA11yAttribute('.v-input__slot', 'aria-controls', menuId, (this.$refs.vSelectA11y as Vue)?.$el);
        }
      }, 0);
    },
  },

};
</script>
