<template>
  <div @click="setPaginationA11y" @keydown="setPaginationA11y">
    <v-data-table
      ref="vDataTableA11y"
      v-bind="$attrs"
      v-on="$listeners">
      <!-- Pass on all named slots -->
      <slot v-for="slot in Object.keys($slots)" :slot="slot" :name="slot" />

      <!-- Pass on all scoped slots -->
      <template v-for="slot in Object.keys($scopedSlots)" :slot="slot" slot-scope="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import helpers from '@libs/component-lib/helpers';

export default Vue.extend({
  name: 'VDataTableA11y',

  mounted() {
    helpers.setElementA11yAttribute('.v-data-footer__select  .v-input__slot', 'role', 'combobox', (this.$refs.vDataTableA11y as Vue)?.$el);
  },

  methods: {
    setPaginationA11y() {
      setTimeout(() => {
          const paginationMenuId = document.querySelector('.v-menu__content.menuable__content__active .v-list.v-select-list')?.id;
          if (paginationMenuId) {
            helpers.setElementA11yAttribute('.v-data-footer__select .v-input__slot', 'aria-controls', paginationMenuId, (this.$refs.vDataTableA11y as Vue)?.$el);
          }
      }, 0);
    },

  },

});
</script>
