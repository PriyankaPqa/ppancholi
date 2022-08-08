<template>
  <div class="rc-RCFilterToolbar__container">
    <rc-toolbar
      :labels="labels"
      :filter.sync="selectedFilter"
      :show-filter-panel.sync="showFilterPanel"
      :exportable="exportable"
      :importable="importable"
      :count="count"
      @import="$emit('import')"
      @export="$emit('export')">
      <template #toolbarActions>
        <slot name="toolbarActions" />
      </template>
    </rc-toolbar>
    <rc-filter-panel
      v-if="showFilterPanel"
      ref="rcFilterPanel"
      :labels="labels"
      :filter-operators="filterOperators"
      :loading="loading"
      :show.sync="showFilterPanel"
      :filter-key="filterKey"
      :filter-options="filterOptions"
      :selected-filter.sync="selectedFilter"
      :user-filters="userFilters"
      @update:autocomplete="$emit('update:autocomplete', $event)"
      @change:autocomplete="$emit('change:autocomplete', $event)"
      @load:filter="$emit('load:filter', $event)"
      v-on="$listeners" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import _isArray from 'lodash/isArray';
import {
  EDateMode, EFilterOperator, EFilterPanelEvents, IFilter, IFilterData, IFilterDTO, IFilterSettings, IFilterToolbarLabels, IFilterTypeOperators,
} from '@libs/component-lib/types';
import RcToolbar from '@libs/component-lib/components/molecule/RcFilterToolbar/RcToolbar.vue';
import RcFilterPanel from '@libs/component-lib/components/molecule/RcFilterToolbar/RcFilterPanel.vue';
import FilterToolbarDefaults from '@libs/component-lib/components/molecule/RcFilterToolbar/FilterToolbarDefaults';

/**
 * A filter toolbar which allows the user to build preset filters used for search queries.
 */
export default Vue.extend({
  name: 'RcFilterToolbar',
  components: {
    RcToolbar,
    RcFilterPanel,
  },
  props: {
    /** Localizable labels, if not provided by the application, will use English locale values by default */
    labels: {
      type: Object as () => IFilterToolbarLabels,
      default: () => FilterToolbarDefaults.labels,
    },
    /** Localizable filter operators, if not provided by the application, will use English locale values by default */
    filterOperators: {
      type: Object as () => IFilterTypeOperators,
      default: () => FilterToolbarDefaults.filterOperators,
    },
    /**
     * Filter identifier that used to associate filters with a specific application page/control.
     * Example: caseFileFilters, eventFilters...
     */
    filterKey: {
      type: Number,
      required: true,
    },
    /**
     * The array of filters to show in the filter panel.
     * @property {Array<IFilterSettings>} filterOptions. See IFilterSettings for details
     */
    filterOptions: {
      type: Array as () => Array<IFilterSettings>,
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

    count: {
      type: Number,
      required: true,
    },

    userFilters: {
      type: Array as () => Array<IFilterDTO>,
      default: () => [] as Array<IFilterDTO>,
    },

    loading: {
      type: Boolean,
      default: false,
    },

    initialFilter: {
      type: Object as () => IFilter,
      default: () => ({}),
    },
  },

  data() {
    return {
      showFilterPanel: false,
      selectedFilter: _cloneDeep(this.initialFilter || {}) as IFilter,
    };
  },
  watch: {
    selectedFilter(newValue: IFilter) {
      const filters: Array<IFilterData> = [];
      if (newValue.filters && newValue.filters.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newValue.filters.forEach((filter: any) => {
          let { value, operator } = filter;

          const dateMode = typeof filter.dateMode !== 'undefined' ? filter.dateMode : EDateMode.ConvertLocalToUtc;

          if (_isArray(filter.value) && !filter.value.length) {
            return;
          }

          if (filter.type === 'date') {
            // If the date is Equal to, we need to search between the start of day and the end of day
            if (filter.operator === EFilterOperator.Equal) {
              operator = EFilterOperator.Between;

              value = [
                this.getStartOfDay(value, dateMode),
                this.getEndOfDay(value, dateMode),
              ];
            } else if (filter.operator === EFilterOperator.Between) {
              value = [
                this.getStartOfDay(value[0], dateMode),
                this.getEndOfDay(value[1], dateMode),
              ];
            } else if (filter.operator === EFilterOperator.LessEqual || filter.operator === EFilterOperator.GreaterThan) {
              value = this.getEndOfDay(value, dateMode);
            } else {
              value = this.getStartOfDay(value, dateMode);
            }
          }

          filters.push({
            key: filter.key,
            keyType: filter.keyType,
            type: filter.type,
            operator,
            value,
          });
        });
      }
      this.$emit(EFilterPanelEvents.UpdateAppliedFilter, filters, this.selectedFilter);
    },
    showFilterPanel(newValue) {
      if (newValue) {
        this.$emit('open');
      }
    },
  },

  methods: {
    getStartOfDay(value: string, dateMode: EDateMode): string {
      const date = this.parseDate(value);
      if (dateMode === EDateMode.ConvertLocalToUtc) {
        return new Date(date[0], date[1] - 1, date[2], 0, 0, 0, 0).toISOString();
      } if (dateMode === EDateMode.Static) {
        return new Date(Date.UTC(date[0], date[1] - 1, date[2], 0, 0, 0, 0)).toISOString();
      }
      return '';
    },

    getEndOfDay(value: string, dateMode: EDateMode): string {
      const date = this.parseDate(value);
      if (dateMode === EDateMode.ConvertLocalToUtc) {
        return new Date(date[0], date[1] - 1, date[2], 23, 59, 59, 999).toISOString();
      }
      if (dateMode === EDateMode.Static) {
        return new Date(Date.UTC(date[0], date[1] - 1, date[2], 23, 59, 59, 999)).toISOString();
      }
      return '';
    },

    parseDate(value: string): number[] {
      // eslint-disable-next-line radix
      return value.split('-').map((p) => parseInt(p));
    },

    setEditMode(value: boolean) {
      (this.$refs.rcFilterPanel as InstanceType<typeof RcFilterPanel>).editMode = value;
    },
  },
});
</script>

<style scoped lang="scss">
.rc-RCFilterToolbar__container {
  position: relative;
  border-bottom: 1px solid;
  border-color: var(--v-grey-lighten2);

  & ::v-deep .v-btn {
    margin-right: 12px;
    color: var(--v-grey-darken4);
  }

  & ::v-deep .v-btn:last-child {
    margin-right: 0;
  }
}
</style>
