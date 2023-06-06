<template>
  <v-form ref="form" v-model="formModel">
    <v-container class="pa-0" fluid>
      <v-row>
        <v-col class="pa-0" cols="12">
          <v-text-field
            v-model="filterName"
            outlined
            data-test="filterToolbar__filterName"
            :label="labels.formFilterName"
            :rules="[rules.required, rules.maxLength]"
            :max="MAX_LENGTH_MD" />
        </v-col>
      </v-row>

      <v-row
        v-for="filter in filterOptions"
        :key="filter.key"
        :class="{ 'complex-filter': isComplexFilter(filter.type) }">
        <template v-if="filter.type === EFilterType.Text">
          <v-col cols="12" class="pa-0 mb-4">
            <div class="rc-body16 fw-bold">
              {{ filter.label }}
            </div>
          </v-col>

          <v-col class="pa-0 pr-6" cols="4">
            <v-select
              v-model="filterValues[filter.key].operator"
              class="flex-right"
              :menu-props="menuProps"
              :disabled="filter.disabled"
              :attach="true"
              outlined
              :items="filterOperators[filter.type]"
              :item-text="(item) => filterOperators[filter.type].find(i => item.operator === i.operator).label || labels.operators[item.operator]"
              :item-value="(item) => item.operator" />
          </v-col>

          <v-col class="pa-0" cols="8">
            <v-text-field
              v-model="filterValues[filter.key].value"
              v-bind="filter.props"
              :data-test="getDataTest(filter)"
              clearable
              outlined
              :disabled="filter.disabled"
              :rules="[rules.maxLength]"
              :label="filter.label" />
          </v-col>
        </template>

        <template v-if="filter.type === EFilterType.Number">
          <v-col cols="12" class="pa-0">
            <div class="rc-body16 fw-bold mb-4">
              {{ filter.label }}
            </div>
          </v-col>

          <v-col class="pa-0 pr-6" cols="4">
            <v-select
              v-model="filterValues[filter.key].operator"
              class="flex-right"
              :menu-props="menuProps"
              outlined
              :attach="true"
              :disabled="filter.disabled"
              :items="filterOperators[filter.type]"
              :item-text="(item) => filterOperators[filter.type].find(i => item.operator === i.operator).label || labels.operators[item.operator]"
              :item-value="(item) => item.operator"
              @change="filterValues[filter.key].value = ''" />
          </v-col>

          <number
            v-if="filterValues[filter.key].operator === EFilterOperator.Between"
            :id="filter.key"
            v-model="filterValues[filter.key].value"
            :filter="filter"
            :labels="labels"
            :disabled="filter.disabled"
            :start-label="filter.startLabel"
            :end-label="filter.endLabel" />

          <v-col v-else class="pa-0" cols="8">
            <v-text-field
              v-model="filterValues[filter.key].value"
              v-bind="filter.props"
              :disabled="filter.disabled"
              :data-test="getDataTest(filter)"
              clearable
              outlined
              :label="filter.label"
              type="number" />
          </v-col>
        </template>

        <v-col
          v-if="filter.type === EFilterType.Select
            || filter.type === EFilterType.MultiSelect
            || filter.type === EFilterType.SelectExclude
            || filter.type === EFilterType.MultiSelectExclude"
          class="pa-0"
          cols="12">
          <v-autocomplete-with-validation
            :ref="`searchInput_${filter.key}`"
            v-model="filterValues[filter.key].value"
            :menu-props="menuProps"
            outlined
            :attach="true"
            clearable
            :loading="filter.loading"
            :disabled="filter.disabled"
            v-bind="filter.props"
            :data-test="getDataTest(filter)"
            :label="filter.label"
            :items="filter.items"
            :multiple="filter.type === EFilterType.MultiSelect || filter.type === EFilterType.MultiSelectExclude"
            :chips="filter.type === EFilterType.MultiSelect || filter.type === EFilterType.MultiSelectExclude"
            @update:search-input="onAutoCompleteSearchUpdated(filter.key, $event, filterValues[filter.key].value)"
            @change="onAutoCompleteChange(filter.key, $event)" />
        </v-col>

        <template v-if="filter.type === EFilterType.Date">
          <v-col cols="12" class="pa-0">
            <div class="rc-body16 fw-bold mb-4">
              {{ filter.label }}
            </div>
          </v-col>

          <v-col class="pa-0 pr-6" cols="4">
            <v-select
              v-model="filterValues[filter.key].operator"
              :disabled="filter.disabled"
              class="flex-right"
              :attach="true"
              :menu-props="menuProps"
              outlined
              :items="filterOperators[filter.type]"
              :item-text="(item) => filterOperators[filter.type].find(i => item.operator === i.operator).label || labels.operators[item.operator]"
              :item-value="(item) => item.operator"
              @change="filterValues[filter.key].value = ''" />
          </v-col>

          <v-col class="pa-0 d-flex align-center" cols="8">
            <date-range
              v-if="filterValues[filter.key].operator === EFilterOperator.Between"
              :id="filter.key"
              v-model="filterValues[filter.key].value"
              :attach="true"
              :disabled="filter.disabled"
              :label="filter.label"
              :labels="labels"
              :start-label="filter.startLabel"
              :end-label="filter.endLabel" />

            <date
              v-else
              :id="filter.key"
              v-model="filterValues[filter.key].value"
              :disabled="filter.disabled"
              :label="filter.label"
              :operators="filterOperators[filter.type]"
              :selected-operator.sync="filterValues[filter.key].operator" />
          </v-col>
        </template>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import _isArray from 'lodash/isArray';
import {
  EFilterFormEvents, EFilterOperator, EFilterType, FilterFormData, FilterItems, IFilterSettings, IFilterToolbarLabels, IFilterTypeOperators,
} from '@libs/component-lib/types';
import { VAutocompleteWithValidation } from '@libs/component-lib/components';
import { MAX_LENGTH_MD } from '@libs/component-lib/constants/validations';
import Number from './inputs/Number.vue';
import Date from './inputs/Date.vue';
import DateRange from './inputs/DateRange.vue';

/**
 * Maps the filterOptions to filter values. The filter values are bound to UI controls and
 * could change by used through UI interface.
 * @param {Array<IFilterSettings>} filterOptions The list of filter settings from the filterOptions prop
 * @param {IFilterTypeOperators} operators The list of available operators per filter type
 */
function generateFilters(
filterOptions: Array<IFilterSettings>,
  operators: IFilterTypeOperators,
): FilterItems {
  const filterItems: FilterItems = {};

  filterOptions.forEach((filter) => {
    if (filter.value && filter.operator) {
      filterItems[filter.key] = { value: filter.value, operator: filter.operator };
    } else {
      // take a first available operator as default operator.
      const defaultOperator = operators[filter.type][0].operator;
      switch (filter.type) {
        case EFilterType.MultiSelect:
        case EFilterType.MultiSelectExclude:
          filterItems[filter.key] = { value: [], operator: defaultOperator };
          break;
        default:
          filterItems[filter.key] = { value: '', operator: defaultOperator };
          break;
      }
    }
  });

  return filterItems;
}

/**
 * A filter toolbar which allows the user to build preset filters used for search queries.
 *
 */
const vueComponent: VueConstructor = Vue.extend({
  name: 'RcFilterForm',

  components: {
    Number,
    Date,
    DateRange,
    VAutocompleteWithValidation,
  },

  props: {
    /**
     * Contains localizable labels that are used by component.
     */
    labels: {
      type: Object as () => IFilterToolbarLabels,
      // eslint-disable-next-line
      default: () => ({} as any),
    },
    /**
     * filter types operators.
     * */
    filterOperators: {
      type: Object as () => IFilterTypeOperators,
      required: true,
    },
    /**
     * The array of filter settings to show in the filter form.
     * @property {string} key The key of the field to filter on
     * @property {string} type The type of filter. Options are text, number, date, daterange, select, multiselect.
     * @property {string} label The label for the filter input.
     * @property {Array<Record<string, string>>} items The items to render in a select or multiselect.
     */
    filterOptions: {
      type: Array as () => Array<IFilterSettings>,
      required: true,
    },
    /** A filter values that loaded from storage. */
    formData: {
      type: Object as () => FilterFormData,
      // eslint-disable-next-line
      default: () => ({} as any),
    },
  },

  data() {
    return {
      filterName: '',
      filterValues: generateFilters(this.filterOptions, this.filterOperators),
      rules: {
        required: (value: string) => !!value || this.labels.formRequiredField,
        maxLength: (value: string) => {
          if (value && value.length > MAX_LENGTH_MD) {
            return this.labels.errors?.maxLength || this.$t('validations.max', { value: MAX_LENGTH_MD });
          }

          return true;
        },
      },
      formModel: true,
      EFilterType,
      EFilterOperator,
      menuProps: {
        bottom: true,
        offsetY: true,
      },
      MAX_LENGTH_MD,
    };
  },

  watch: {
    formModel() {
      this.emitValidation();
    },
    filterValues: {
      handler(newValues) {
        this.$emit(EFilterFormEvents.UpdateFormData, { name: this.formData.name, values: newValues });

        // notify that form has been changed.
        this.$emit(EFilterFormEvents.Changed, true);
        this.emitValidation();
      },
      deep: true,
    },
    filterName(newName: string) {
      this.$emit(EFilterFormEvents.UpdateFormData, { name: newName, values: this.formData.values });

      // notify that form has been changed.
      this.$emit(EFilterFormEvents.Changed, true);

      this.emitValidation();
    },
    formData: {
      handler(newData: FilterFormData) {
        this.filterName = newData.name;
        this.filterValues = newData.values;
      },
      deep: true,
    },
  },

  mounted() {
    if (this.labels.defaultFilterName) {
      this.filterName = this.labels.defaultFilterName;
    }
  },

  methods: {
    emitValidation() {
      // validate the form.
      if (this.validateForm(this.formData.values)) {
        this.$emit(EFilterFormEvents.Validate, true);
      } else {
        this.$emit(EFilterFormEvents.Validate, false);
      }
    },

    validateForm(formFilters: FilterItems): boolean {
      if (this.formModel === false) {
        return false;
      }
      let valid = true;

      if (!this.filterName || this.filterName.length < 1) {
        valid = false;
      }

      let filtersCount = 0;

      this.filterOptions.forEach((option) => {
        const filterValue = formFilters[option.key];
        if (filterValue && filterValue.value) {
          let flValue = filterValue.value.toString();
          const isArray = _isArray(filterValue.value);
          let arrayHasItem = false;

          if (isArray) {
            arrayHasItem = (filterValue.value as string[]).length > 0;
            flValue = flValue.replace(',', ''); // remove array item separator
          }

          if (flValue.length > 0 || (isArray && arrayHasItem)) {
            filtersCount += 1;
          }
        }
        if (filterValue && filterValue.value === false) { // Boolean filter true / false
          filtersCount += 1;
        }
      });

      if (filtersCount <= 0) {
        valid = false;
      }
      return valid;
    },

    isComplexFilter(type: string): boolean {
      return type === EFilterType.Number || type === EFilterType.Date || type === EFilterType.Text;
    },

    onAutoCompleteSearchUpdated(filterKey: string, search: string, selectedItem: unknown) {
      this.$emit('update:autocomplete', { filterKey, search, selectedItem });
    },
    onAutoCompleteChange(filterKey: string, $event: unknown) {
      this.$emit('change:autocomplete', { filterKey, value: $event });
    },

    getDataTest(filter: IFilterSettings): string {
      if (!filter) {
        return '';
      }
      return `filterToolbar__input-${filter.key}-${filter.type}`.replace(/[\s,/]/g, '') as string;
    },
  },
});

export default vueComponent;
</script>

<style scoped lang="scss">
.flex-right {
  flex: 1;
}
.complex-filter{
  margin-bottom: 32px !important;
  border-radius: 4px;
  background: var(--v-grey-lighten5);
  padding: 12px;

  & ::v-deep .v-input__slot {
   background: var(--v-white-base);
  }
}

</style>
