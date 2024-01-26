<template>
  <div @click="setPaginationA11y" @keydown="setPaginationA11y">
    <v-data-table
      ref="vDataTableA11y"
      v-bind="$attrs"
      :data-test="`${$attrs['data-test']}_inner`"
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
import _debounce from 'lodash/debounce';

export default Vue.extend({
  name: 'VDataTableA11y',

  async mounted() {
    await this.setDataTableA11y();
  },

  updated() {
    this.setDataTableFooterA11y();
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

    setValueForEmptyTableHeader() {
      const header = (this.$refs.vDataTableA11y as Vue)?.$el.querySelectorAll('th.text-start');
      header?.forEach((th) => {
        const span = th.querySelector('span');
        if (!span) {
          const newSpan = document.createElement('span');
          newSpan.textContent = this.$t('a11y.empty_table_header_cell') as string;
          newSpan.setAttribute('class', 'rc-transparent-text');
          newSpan.setAttribute('style', 'position: absolute; font-size: 1px');
          th.appendChild(newSpan);
        }
        if (span && !span.innerHTML) {
          span.textContent = this.$t('a11y.empty_table_header_cell') as string;
          span.setAttribute('class', 'rc-transparent-text');
          span.setAttribute('style', 'position: absolute; font-size: 1px');
        }
      });
    },

    setDataTableA11y() {
      setTimeout(() => {
        helpers.setElementA11yAttribute(
 '.text-start button.v-icon.v-data-table__expand-icon',
          'aria-label',
          this.$t('common.buttons.expand') as string,
          (this.$refs.vDataTableA11y as Vue)?.$el,
);
        this.setValueForEmptyTableHeader();
      }, 500);
    },

    setDataTableFooterA11y: _debounce(function func(this:any) {
      helpers.setElementA11yAttribute('.v-data-footer__select  .v-input__slot', 'role', 'combobox', (this.$refs.vDataTableA11y as Vue)?.$el);
    }, 500),
  },

});
</script>

<style scoped lang="scss">
::v-deep .v-data-table__empty-wrapper {
  color: var(--v-grey-darken2) !important;
}
</style>
