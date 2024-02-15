/* eslint-disable */
export enum EFilterType {
  Text = 'text',
  Number = 'number',
  Select = 'select',
  MultiSelect = 'multiselect',
  Date = 'date',
  SelectExclude = 'selectExclude',
  MultiSelectExclude = 'multiselectExclude',
}

export enum EFilterOperator {
  Between = 'Between',
  Equal = 'Equal',
  GreaterEqual = 'GreaterEqual',
  GreaterThan = 'GreaterThan',
  LessThan = 'LessThan',
  LessEqual = 'LessEqual',
  In = 'In',
  BeginsWith = 'BeginsWith',
  EndsWith = 'EndsWith',
  Contains = 'Contains',
  DoesNotContain = 'DoesNotContain',
  FuzzySearch = 'FuzzySearch',
  NotIn = 'NotIn',
  NotEqual = 'NotEqual',
}

export enum EFilterPanelEvents {
  Load = 'load:all',
  Save = 'save:filter',
  Delete='delete:filter',
  UpdateShow = 'update:show',
  UpdateSelectedFilter = 'update:selectedFilter',
  UpdateAppliedFilter = 'update:appliedFilter',
}

export enum EFilterFormEvents {
  Changed = 'form-changed',
  Validate = 'validate',
  UpdateFormData = 'update:formData',
}

export enum EFilterListEvents {
  loadFilter = 'load:filter',
  copyFilter = 'copy:filter',
  deleteFilter = 'delete:filter',
  newFilter = 'new:filter',
}

export enum EFilterToolbarEvents {
  updateFilter = 'update:filter',
  updateShowFilterPane = 'update:showFilterPanel',
}

export enum EFilterKeyType {
  Array = 'array',
  Guid = 'guid',
}

export enum EDateMode {
  ConvertLocalToUtc = 'convertLocalToUtc',
  Static = 'static',
}


export interface IFilterOperator {
  label: string,
  operator: EFilterOperator
}

export interface IFilter {
  name?: string;
  filters: any;
}

export interface IFilterData {
  key: string; // key The key of the field to filter on.
  keyType?: EFilterKeyType; // The type of the property in Azure Search DB (if it's an array or not)
  dateMode?: EDateMode;
  type: EFilterType; // filter type, see EFilterType for details.
  value?: string | Array<string> | Array<number> | number | Record<string, unknown> | boolean; // a filter value, if not provided, a default value will be used.
  operator?: string; // an operator, if not provided a default operator will be selected.
}

export interface IFilterSettings {
  key: string; // key The key of the field to filter on.
  keyType?: EFilterKeyType; // // The type of the property in Azure Search DB (if it's an array or not)
  value?: string | Array<string> | boolean; // a filter value, if not provided, a default value will be used.
  operator?: string; // an operator, if not provided a default operator will be selected.
  label: string; // localizable label.
  startLabel?: string;
  endLabel?: string;
  type: EFilterType; // filter type, see EFilterType for details.
  items?: Array<{text: string, value: unknown}>; // in case of dropdown and multi-select  - a list of available options to select from.
  loading?: boolean; // loading items
  disabled?: boolean;
  dateMode?: EDateMode; // Rule how the date will be sent to the filter
  props?: Record<string, unknown> // To pass additional props related to the vuetify component
}

// aligned with web-api interface
export interface IFilterDTO {
  name: string,
  filterKey: number,
  criteria: Array<Array<string>> // [ [dateRange, between, date1, date2] ]
}

export type FilterItem = { operator: string; value: string | Array<string> | boolean };
export type FilterItems = Record<string, FilterItem>;
export type FilterFormData = { name: string; values: FilterItems; }
export type IFilterTypeOperators = Record<EFilterType, Array<IFilterOperator>>
