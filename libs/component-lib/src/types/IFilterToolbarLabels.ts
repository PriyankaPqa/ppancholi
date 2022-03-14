export interface IFilterToolbarLabels {
    save: string;
    cancel: string;
    apply: string;
    download: string;
    filterCopySuffix: string;
    yourFilters: string;
    tooltipNew: string;
    tooltipAdd: string;
    tooltipCopy: string;
    tooltipDelete: string;
    tooltipCloseFilter: string;
    removeTitle: string;
    removeBody: string;
    removeCancel: string;
    removeConfirm: string;
    importLabel: string;
    exportLabel: string;
    exportTitle: string;
    exportCancel: string;
    exportDownload: string;
    exportFormat: string;
    exportItems: string;
    formFilterName: string;
    formRequiredField: string;
    operators: Record<string, string>;
    errors: Record<string, string>; // key, message
    dialogTitle: string;
    filterSubtitle: string;
    defaultFilterName: string;
}
