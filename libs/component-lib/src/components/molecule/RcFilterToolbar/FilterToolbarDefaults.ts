import {
  IFilterToolbarLabels, IFilterTypeOperators, EFilterOperator, EFilterType,
} from '@libs/component-lib/types';

const labels: IFilterToolbarLabels = {
  save: 'Save',
  cancel: 'Cancel',
  apply: 'Apply',
  download: 'Download',
  filterCopySuffix: 'copy',
  yourFilters: 'Your filters',
  tooltipNew: 'New filter',
  tooltipAdd: 'Add filter',
  tooltipCopy: 'Copy filter',
  tooltipDelete: 'Delete filter',
  tooltipCloseFilter: 'Click to close filter',
  removeTitle: 'Delete filter',
  removeBody: 'Are you sure you want delete this filter?',
  removeCancel: 'Keep it',
  removeConfirm: 'Delete it',
  importLabel: 'Import',
  exportLabel: 'Export',
  exportTitle: 'Export to CSV',
  exportCancel: 'Cancel',
  exportDownload: 'Download',
  exportFormat: 'Format',
  exportItems: 'Items',
  formFilterName: 'Filter Name',
  formRequiredField: 'This field is required',
  dialogTitle: 'My title',
  filterSubtitle: 'Add or click on a filter to apply, edit or delete',
  defaultFilterName: 'My filter',
  operators: {
    [EFilterOperator.Between]: 'Between',
    [EFilterOperator.Equal]: 'Equal',
    [EFilterOperator.GreaterEqual]: 'Greater than or equal',
    [EFilterOperator.GreaterThan]: 'Greater than',
    [EFilterOperator.LessThan]: 'Less than',
    [EFilterOperator.LessEqual]: 'Less than or equal',
    [EFilterOperator.In]: 'In',
    [EFilterOperator.BeginsWith]: 'Begins with',
    [EFilterOperator.EndsWith]: 'Ends with',
    [EFilterOperator.Contains]: 'Contains',
    [EFilterOperator.DoesNotContain]: 'Does not contain',
  },
  errors: {
    maxLength: 'Maximum length exceeded.',
    maxGreaterThanMin: 'Must be greater than start value.',
    401: 'Please make sure that you are signed-in.',
    500: 'Something has gone wrong, please contact customer support service for more details.',
    NoSelectedFilter: 'Please select filter to continue.',
    Error409002CustomFilterDuplicateName: 'The filter name is already in use, please use a different filter name.',
  },
};

const filterOperators: IFilterTypeOperators = {
  [EFilterType.Text]: [
    { label: 'Equal', operator: EFilterOperator.Equal },
    { label: 'Begins With', operator: EFilterOperator.BeginsWith },
    // { label: 'Ends With', operator: EFilterOperator.EndsWith },
    { label: 'Contains', operator: EFilterOperator.Contains },
    // { label: 'Does not contain', operator: EFilterOperator.DoesNotContain },
  ],
  [EFilterType.Text]: [
    { label: 'Equal', operator: EFilterOperator.Equal },
    { label: 'Between', operator: EFilterOperator.Between },
    { label: 'More Than', operator: EFilterOperator.GreaterThan },
    { label: 'Less Than', operator: EFilterOperator.LessThan },
  ],
  [EFilterType.Select]: [
    { label: 'Equal', operator: EFilterOperator.Equal },
  ],
  [EFilterType.SelectExclude]: [
    { label: 'NotEqual', operator: EFilterOperator.NotEqual },
  ],
  [EFilterType.MultiSelect]: [
    { label: 'In', operator: EFilterOperator.In },
  ],
  [EFilterType.MultiSelectExclude]: [
    { label: 'NotIn', operator: EFilterOperator.NotIn },
  ],
  [EFilterType.Date]: [
    { label: 'Equal', operator: EFilterOperator.Equal },
    { label: 'After', operator: EFilterOperator.GreaterThan },
    { label: 'Before', operator: EFilterOperator.LessThan },
    { label: 'Between', operator: EFilterOperator.Between },
    { label: 'On or after', operator: EFilterOperator.GreaterEqual },
    { label: 'On or before', operator: EFilterOperator.LessEqual },
  ],
  [EFilterType.Number]: [
    { label: 'Equal', operator: EFilterOperator.Equal },
    { label: 'Between', operator: EFilterOperator.Between },
    { label: 'GreaterThan', operator: EFilterOperator.GreaterThan },
    { label: 'LessThan', operator: EFilterOperator.LessThan },
  ],
};

export default { labels, filterOperators };
