<template>
  <div :class="{ dataTable__container: true, 'elevation-2': hasBorder }">
    <v-card :class="{ 'has-footer': !!footerText }" :flat="!hasBorder">
      <rc-data-table-header
        v-if="!hideHeader"
        v-bind="headerOptions"
        :search="search"
        :hide-search="hideSearch"
        :show-help="showHelp"
        :help-link="helpLink"
        :labels="mergedLabels.header"
        @update:search="updateSearch">
        <template #headerLeft>
          <rc-tooltip v-if="showAddButton" bottom>
            <template #activator="{ on }">
              <v-btn
                class="mr-3"
                data-test="table__addButton"
                fab
                color="white"
                small
                v-on="on"
                @click="$emit('add-button')">
                <v-icon color="primary">
                  mdi-plus
                </v-icon>
              </v-btn>
            </template>
            {{ mergedLabels.header.addButtonLabel }}
          </rc-tooltip>
          <slot
            v-else
            name="headerLeft" />
        </template>
      </rc-data-table-header>

      <slot name="filter" />

      <rc-data-table-body
        :hide-default-footer="hideFooter"
        :value="value"
        v-bind="tableOptions"
        :item-class="itemClass || (tableProps ? tableProps.itemClass : '')"
        :items="items"
        :headers="headers"
        :count="Math.max(count, items.length)"
        :options="options"
        :custom-columns="customColumns"
        @input="$emit('input', $event)"
        @click:row="$emit('click:row', $event)"
        @update:options="$emit('update:options', $event)">
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
      </rc-data-table-body>
      <div v-if="footerText" class="rc-caption12 fw-light table-footer">
        {{ footerText }}
        <button type="button" class="rc-link12 refresh-button" @click="emitSearchEvent">
          {{ $t("table.refresh") }}
        </button>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _debounce from 'lodash/debounce';

import RcTooltip from '@libs/component-lib/components/atoms/RcTooltip.vue';
import RcDataTableHeader from './components/RcDataTableHeader.vue';
import RcDataTableBody from './components/RcDataTableBody.vue';

const DEBOUNCE_RATE = 500;
const debouncedSearch = _debounce((context) => {
  context.emitSearchEvent();
}, DEBOUNCE_RATE);

/**
 * A data table that includes pagination, sorting, searching, exporting to CSV
 */
export default Vue.extend({
  name: 'RcDataTable',

  components: {
    RcDataTableHeader,
    RcDataTableBody,
    RcTooltip,
  },

  props: {
    /**
     * The array of selected items
     */
    value: {
      type: Array,
      default: () => [] as unknown[],
    },

    /**
     * The array of items to show in the table
     */
    items: {
      type: Array,
      required: true,
    },

    /**
     * The array of headers to show in the table. See https://vuetifyjs.com/en/components/data-tables#api for information on values.
     */
    headers: {
      type: Array,
      required: true,
    },

    /**
     * The array of custom columns for which you are providing templates
     */
    customColumns: {
      type: Array,
      default: () => [] as string[],
    },

    /**
     * The total number of items from the search result
     */
    count: {
      type: Number,
      required: true,
    },

    /**
     * Enables the export feature for this table
     */
    exportable: {
      type: Boolean,
      default: false,
    },
    /**
     * Enables the import feature for this table
     */
    importable: {
      type: Boolean,
      default: false,
    },

    /**
     * Show the help button in the header
     */
    showHelp: {
      type: Boolean,
      default: false,
    },

    /**
     * Show the plus button in the header
     */
    showAddButton: {
      type: Boolean,
      default: false,
    },

    /**
     * Link which is open when clicking on help
     */
    helpLink: {
      type: String,
      default: '',
    },

    /**
     * Vuetify properties for the header bar. See https://vuetifyjs.com/en/components/toolbars#toolbars
     */
    headerProps: {
      type: Object,
      default: null,
    },

    /**
     * Whether or not the header is visible
     */
    hideHeader: {
      type: Boolean,
      default: false,
    },

    /**
     * Text to show at the bottom of the grid
     */
    footerText: {
      type: String,
      default: null,
    },

    /**
     * Vuetify properties for the toolbar. See https://vuetifyjs.com/en/components/toolbars#toolbars
     */
    toolbarProps: {
      type: Object,
      default: null,
    },

    /**
     * Whether or not the search inptu is visible
     */
    hideSearch: {
      type: Boolean,
      default: false,
    },

    /**
     * Vuetify properties for the table. See https://vuetifyjs.com/en/components/data-tables#data-tables
     */
    tableProps: {
      type: Object,
      default: null,
    },

    /**
     * The string labels for the data table and its child components, used for internationalization. See the default for the object structure.
     */
    labels: {
      type: Object,
      default: () => ({
        header: {},
      }),
    },
    /**
     * Hide the footer
     */
    hideFooter: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      default: () => ({
        page: 1,
        itemsPerPage: 10,
        sortBy: [''],
        sortDesc: [false],
      }),
    },

    itemClass: {
      type: Function,
      default: null,
    },

    initialSearch: {
      type: String,
      default: '',
    },

    hasBorder: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      search: this.initialSearch,

      headerDefaults: {
        color: 'primary darken-1',
        dark: true,
        height: 56,
      },

      toolbarDefaults: {
        flat: true,
        color: 'grey lighten-5',
        height: 56,
      },

      tableDefaults: {
        footerProps: { 'items-per-page-options': [5, 10, 15, 20] },
      },

      labelDefaults: {
        header: {
          title: 'Data Table',
          searchPlaceholder: 'Quick search...',
          addButtonLabel: 'Add',
        },
      },
    };
  },

  computed: {
    headerOptions(): Record<string, unknown> {
      return {
        ...this.headerDefaults,
        ...this.headerProps,
      };
    },

    toolbarOptions(): Record<string, unknown> {
      return {
        ...this.toolbarDefaults,
        ...this.toolbarProps,
      };
    },

    tableOptions(): Record<string, unknown> {
      return {
        ...this.tableDefaults,
        ...this.tableProps,
      };
    },

    mergedLabels(): Record<string, unknown> {
      return {
        header: {
          ...this.labelDefaults.header,
          ...this.labels.header,
        },
      };
    },
  },

  watch: {
    search() {
      this.debouncedSearch();
    },

    options(newVal, oldVal) {
      if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        this.emitSearchEvent();
      }
    },
  },

  methods: {
    // When searching we redirect user to the first page
    updateSearch($event: string) {
      this.search = $event;
      setTimeout(() => {
        this.$emit('update:options', { ...this.options, page: 1 });
      }, DEBOUNCE_RATE);
    },
    emitSearchEvent() {
      /**
       * Search event. Emitted when the sorting, pagination, or search are changed.
       * @property {string} search The search term
       * @property {number} pageIndex The page of results
       * @property {number} pageSize The number of results to fetch
       * @property {string} orderBy The field to sort on
       * @property {boolean} descending Whether to sort the results in descending order.
       */

      this.$emit('search', {
        search: this.search,
        pageIndex: this.options.page,
        pageSize: this.options.itemsPerPage,
        orderBy: this.options.sortBy[0],
        descending: this.options.sortDesc[0],
        includeCount: true,
      });
    },

    debouncedSearch() {
      debouncedSearch(this);
    },
  },
});
</script>

<style scoped lang="scss">
.dataTable__container {
  position: relative;
  width: 100%;
}

.table-footer {
  position: relative;
  top: -1px;
  left: 6px;
  height: 0;
}

.has-footer{
  padding-bottom: 15px;
}

.refresh-button {
  margin-top: -2px;
  padding-left: 8px;
  font-weight: bold;
}
</style>
