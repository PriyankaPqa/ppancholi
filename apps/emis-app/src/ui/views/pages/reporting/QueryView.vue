<template>
  <div class="ma-4 dataTable__container elevation-2">
    <v-card>
      <rc-data-table-header
        v-bind="headerOptions"
        :labels="{ title }"
        :show-help="false"
        :hide-search="true">
        <template #headerLeft>
          <div>
            <v-btn
              elevation="0"
              color="transparent"
              data-test="back-button"
              @click="$router.go(-1)">
              <v-icon color="primary">
                mdi-arrow-left
              </v-icon>
              {{ $t('common.buttons.back') }}
            </v-btn>
          </div>
          <v-divider vertical class="mx-4" />
        </template>
        <template #headerRight>
          <v-divider vertical class="mx-4" />
          <div v-if="canShare" class="px-2">
            <v-btn
              data-test="share-button"
              color="primary"
              @click="saveQuery(!canSave, true)">
              <v-icon>
                mdi-share-variant
              </v-icon>
              {{ $t('common.buttons.share') }}
            </v-btn>
          </div>
          <div class="px-2">
            <v-btn
              color="primary"
              data-test="save-as-button"
              @click="saveQuery(true)">
              {{ $t('common.buttons.saveAs') }}
            </v-btn>
          </div>
          <div class="px-2">
            <v-btn
              v-if="canSave"
              color="primary"
              data-test="save-button"
              @click="saveQuery()">
              {{ $t('common.buttons.save') }}
            </v-btn>
          </div>
        </template>
      </rc-data-table-header>
      <div class="pa-4 grid-container">
        <DxDataGrid
          v-if="showGrid"
          ref="gridDx"
          :key="$route.fullPath"
          :data-source="dataSource"
          :column-auto-width="true"
          :show-row-lines="true"
          :show-borders="true"
          :filter-builder="filterBuilder"
          :allow-column-reordering="true"
          :allow-column-resizing="true"
          :columns="columns"
          :sync-lookup-filter-values="false"
          height="calc(100vh - 185px)"
          width="100%"
          @option-changed="handlePropertyChange"
          @exporting="onExporting">
          <DxExport
            :enabled="true" />
          <DxSelection mode="single" />
          <DxGroupPanel :visible="true" />
          <DxScrolling
            mode="virtual"
            row-rendering-mode="virtual" />
          <DxFilterPanel :visible="true" />
          <DxFilterBuilderPopup max-height="600px" max-width="900px" />
          <DxFilterRow
            :visible="true"
            apply-filter="onClick" />
          <DxHeaderFilter
            :visible="false" />

          <DxColumnChooser
            :enabled="true"
            :width="500"
            :height="500"
            mode="dragAndDrop">
            <DxPosition
              my="right top"
              at="right bottom"
              of=".dx-datagrid-column-chooser-button" />
            <DxColumnChooserSearch
              :enabled="true" />
          </DxColumnChooser>
          <DxSorting mode="multiple" />
        </DxDataGrid>
      </div>
    </v-card>

    <rc-confirmation-dialog
      data-test="save_dialog"
      :show.sync="showSaveDialog"
      :title="$t('common.buttons.saveAs')"
      :submit-button-disabled="queryName == null"
      cancel-button-key="common.buttons.cancel"
      submit-button-key="common.buttons.save"
      @submit="doSave(true)">
      <template #default>
        <div>
          <div class="rc-body16 fw-bold mb-4">
            {{ $t('reporting.query.saveAsText') }}
          </div>
          <v-text-field-with-validation
            v-model="queryName"
            data-test="query_name"
            rules="required"
            :label="`${$t('reporting.query.queryName')} *`" />
        </div>
      </template>
    </rc-confirmation-dialog>

    <rc-confirmation-dialog
      ref="exportDialog"
      data-test="export-dialog"
      :show.sync="showExportDialog"
      :title="$t('common.buttons.export')"
      cancel-button-key="common.buttons.cancel"
      submit-button-key="common.buttons.export">
      <template #default>
        <div>
          <div class="rc-body16 fw-bold mb-4">
            {{ $t('reporting.query.selectExportMode') }}
          </div>
          <v-radio-group v-model="exportMode" mandatory>
            <v-radio :label="$t('reporting.format.excel')" value="excel" />
            <v-radio :label="$t('reporting.format.csv')" value="csv" />
          </v-radio-group>
        </div>
      </template>
    </rc-confirmation-dialog>

    <select-users-popup
      v-if="showSelectUserDialog"
      data-test="add-team-members"
      :levels="[UserRolesNames.level4, UserRolesNames.level5, UserRolesNames.level6, UserRolesNames.contributorIM]"
      :title="$t('reporting.query.share.title') + query.name"
      :submit-action-label="$t('common.buttons.share')"
      :show.sync="showSelectUserDialog"
      :top-search-title="$t('reporting.query.share.search_member')"
      :top-selected-title="$t('reporting.query.share.selected_members')"
      :excluded-ids="[currentUserId]"
      :loading="loading"
      @submit="shareToUsers" />
  </div>
</template>
<script lang="ts">

/* eslint-disable complexity */

import Vue from 'vue';
import {
  DxDataGrid, DxColumnChooser, DxColumnChooserSearch, DxPosition, DxHeaderFilter, DxFilterRow,
  DxFilterBuilderPopup, DxFilterPanel, DxSelection, DxGroupPanel, DxScrolling, DxExport, DxSorting,
} from 'devextreme-vue/data-grid';
import _cloneDeep from 'lodash/cloneDeep';

// forced import because of a problem in devexpress being tree-shakened...
import { odata } from 'devextreme/data/odata/query_adapter';

import ODataStore from 'devextreme/data/odata/store';
import { sortBy } from 'lodash';
import AuthenticationProvider from '@/auth/AuthenticationProvider';
import frMessages from 'devextreme/localization/messages/fr.json';
import enMessages from 'devextreme/localization/messages/en.json';
import { locale, loadMessages } from 'devextreme/localization';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { localStorageKeys } from '@/constants/localStorage';
import SelectUsersPopup from '@/ui/shared-components/SelectUsersPopup.vue';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { Column } from 'devextreme/ui/data_grid';
import { RcDataTableHeader, RcConfirmationDialog, VTextFieldWithValidation } from '@libs/component-lib/components';
import { IQuery, QueryType } from '@libs/entities-lib/reporting';
import { useUserStore } from '@/pinia/user/user';
import helpers from '@/ui/helpers/helpers';
import libHelpers from '@libs/component-lib/helpers';
import sharedHelpers from '@libs/shared-lib/helpers/helpers';
import { UserTeamMember } from '@libs/entities-lib/user-account';
import { UserRoles, UserRolesNames } from '@libs/entities-lib/user';
import config from 'devextreme/core/config';
import { ExtendedColumn, IDatasourceSettings, LookupType, datasources } from './datasources';
import { AllReports } from './standard_queries/standard_queries';
import { ReportingPages } from './reportingPages';

// with forceIsoDateParsing to false and deserializeDates to false
// we can have some dates as utc and others local
config({
    forceIsoDateParsing: false,
});

export default Vue.extend({
  name: 'QueryView',

  components: {
    DxDataGrid,
    DxSorting,
    DxColumnChooser,
    DxColumnChooserSearch,
    DxPosition,
    DxHeaderFilter,
    DxFilterRow,
    DxFilterBuilderPopup,
    DxFilterPanel,
    DxSelection,
    DxGroupPanel,
    DxScrolling,
    DxExport,
    RcConfirmationDialog,
    RcDataTableHeader,
    VTextFieldWithValidation,
    SelectUsersPopup,
  },
  props: {
    queryId: {
      type: String,
      default: null,
    },
    theme: {
      type: String,
      default: null,
    },
    queryTypeName: {
      type: String,
      default: 'Custom',
    },
  },
  data() {
    // there is an issue with treeshaking removing the odata query adapter.  the import here and its use is to force it so it works in production mode...
    // eslint-disable-next-line
    if (!odata) console.log('odata loaded: ', odata !== null);

    return {
      currentUserId: useUserStore().getUserId(),
      UserRolesNames,
      loading: false,
      showSelectUserDialog: false,
      showGrid: false,
      headerOptions: {
        color: 'primary darken-1',
        dark: true,
        height: 56,
      },
      dsType: null as IDatasourceSettings,
      dataSource: null as { store: ODataStore, select: string[] },
      filterBuilderPopupPosition: {
        of: window,
        at: 'top',
        my: 'top',
        offset: { y: 10 },
      },
      filterBuilder: {
        allowHierarchicalFields: false,
      },
      columns: [] as Column<any, any>[],
      grid: null as DxDataGrid,
      exportMode: 'excel',
      query: {
        name: null,
        queryType: QueryType.Custom,
        topic: this.theme ? Number(this.theme) : datasources[0].reportingTopic,
      } as IQuery,
      showSaveDialog: false,
      showExportDialog: false,
      queryName: null as string,
      shareAfterSave: false,
    };
  },
  computed: {
    queryType(): QueryType {
      return ReportingPages.queryTypeByName(this.queryTypeName, this.$i18n.locale);
    },

    title(): string {
      return ReportingPages.titleForQuery(this.query, this);
    },
    canSave(): boolean {
      return this.query.queryType === QueryType.Custom;
    },
    canShare(): boolean {
      return this.$hasLevel(UserRoles.level5) || this.$hasRole(UserRoles.contributorIM);
    },
  },
  watch: {
    $route() {
      // to rebind language
      this.bindQuery();
    },
  },
  async mounted() {
    await this.bindQuery(true);
    await this.setElementA11yAttributeWithDelay();
  },

  methods: {
    async bindQuery(initialLoad = false) {
      if (this.queryType === QueryType.Custom) {
        if (initialLoad) {
          if (this.queryId) {
            this.query = await this.$services.queries.get(this.queryId);
          }
        } else {
          // custom queries we can keep the current state
            this.query.state = window.btoa(JSON.stringify(this.grid?.instance?.state()));
          }
      } else {
        // standard queries are simply different between french and english - the user will start fresh all the time
        this.query = AllReports.find((r) => r.id === this.queryId && r.queryType === this.queryType);
      }

      this.initializeGrid();
    },

    /// this sets the datasource for the grid and loads its state
    /// timeouts are required to make sure the grid is ready to receive the information
    /// also this sets all the locale for the grid
    async initializeGrid() {
      this.showGrid = false;
      this.grid = null;
      await this.initializeDatasource();
      loadMessages(this.$i18n.locale === 'fr' ? frMessages : enMessages);
      locale(this.$i18n.locale);
      await helpers.timeout(50);
      this.showGrid = true;
      while (!this.grid) {
        // eslint-disable-next-line no-await-in-loop
        await helpers.timeout(50);
        this.grid = (this.$refs.gridDx as DxDataGrid);
      }
      if (this.query.state) {
        this.grid.instance?.state(JSON.parse(this.queryType === QueryType.Custom ? window.atob(this.query.state) : this.query.state));
      }
      this.refreshData();
    },

    /// this picks the right datasource for this query.  Also it sets the initial "select" list to the list of columns that are visible by default
    async initializeDatasource() {
      const ds = datasources.find((d) => d.reportingTopic === this.query.topic);
      let columns = sortBy(ds.columns.map((c) => ({
        ...c,
        caption: this.$t(c.caption) as string,
        cssClass: `grid-column ${c.cssClass || ''}`,
        allowSearch: c.allowSearch !== false && c.visible !== false,
      })), (x) => x.caption.toLowerCase()) as ExtendedColumn[];

      columns = columns.filter((c) => !c.featureKey || this.$hasFeature(c.featureKey));

      const select = columns.filter((c) => c.visible !== false).map((c) => c.dataField);
      Object.keys(ds.key).forEach((k) => {
          if (select.indexOf(k) === -1) {
          select.push(k);
        }
      });

      await this.initializeLookups(columns);

      columns.filter((c) => c.dataType === 'datetime' || c.dataType === 'date').forEach((c) => {
        const format = c.dataType === 'date' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm';
        c.format = c.asUtcDate ? (d: Date) => helpers.getUtcStringDate(d, format) : format;
        if (!c.asUtcDate) {
          c.calculateFilterExpression = (value, selectedFilterOperations, target) => this.calculateDateFilterForLocalDates(c, value, selectedFilterOperations, target);
        }
      });

      this.dsType = ds;
      this.columns = columns;

      this.dataSource = {
        store: new ODataStore({
          deserializeDates: false,
          url: `${localStorage.getItem(localStorageKeys.baseUrl.name)}/${ds.url}`,
          // url: `${localStorage.getItem(localStorageKeys.baseUrl.name)}/${ds.url}`.replace('api-dev.crc-tech.ca/common', 'localhost:44352'),
          key: Object.keys(ds.key),
          keyType: ds.key,
          version: 4,
          filterToLower: false,
          beforeSend(e) {
              const accessToken = AuthenticationProvider.accessToken;
              if (accessToken) {
                // Add the access token to the request headers
                e.headers = { ...e.headers, Authorization: `Bearer ${accessToken}` };
              }
              // give a 1 hour timeout on the FE - BE timeout is smaller anyways (like 2 minutes...)
              // so the BE is driving the show
              e.timeout = 60 * 60000;
          },
        }),
        select,
      };
    },

    // eslint-disable-next-line complexity
    async initializeLookups(columns: ExtendedColumn[]) {
      const results = await Promise.all([
              this.$services.queries.fetchEnums(),
              this.$services.queries.fetchListOptions(),
              columns.find((x) => x.lookupType === LookupType.eventEn || x.lookupType === LookupType.eventFr) ? this.$services.queries.fetchEvents() : null,
              columns.find((x) => x.lookupType === LookupType.programNameEn || x.lookupType === LookupType.programNameFr)
                    ? await this.$services.queries.fetchPrograms() : null,
            ]);
      const enums = results[0].value;
      const listOptions = results[1].value.filter((option) => !option.isHidden);
      const events = results[2]?.value || [];
      const programs = results[3]?.value || [];
      const normalize = (item: string) => sharedHelpers.getNormalizedString(item).toLocaleLowerCase();
      for (let i = 0; i < columns.length; i += 1) {
        const col = columns[i];
        switch (col.lookupType) {
          case LookupType.enumEn:
            col.lookup = { dataSource: sortBy(enums.filter((e) => e.entity === col.lookupKey).map((x) => x.english), [normalize]) };
            break;
          case LookupType.enumFr:
            col.lookup = { dataSource: sortBy(enums.filter((e) => e.entity === col.lookupKey).map((x) => x.french), [normalize]) };
            break;
          case LookupType.optionItemEn:
            col.lookup = { dataSource: sortBy(listOptions
                .filter((e) => e.discriminator === col.lookupKey && !!col.lookupSubItems === !!e.parentListOptionId).map((x) => x.english), [normalize]) };
            break;
          case LookupType.optionItemFr:
            col.lookup = { dataSource: sortBy(listOptions
                .filter((e) => e.discriminator === col.lookupKey && !!col.lookupSubItems === !!e.parentListOptionId).map((x) => x.french), [normalize]) };
            break;
          case LookupType.eventEn:
            col.lookup = { dataSource: sortBy(events.map((x) => x.english), [normalize]) };
            break;
          case LookupType.eventFr:
            col.lookup = { dataSource: sortBy(events.map((x) => x.french), [normalize]) };
            break;
          case LookupType.programNameEn:
            col.lookup = { dataSource: sortBy(programs.map((x) => x.english), [normalize]) };
            break;
          case LookupType.programNameFr:
            col.lookup = { dataSource: sortBy(programs.map((x) => x.french), [normalize]) };
            break;
          default:
            // for non-lookups we need to remove 'anyof' and 'noneof' which if not using a lookup would download the whole dataset
            // unfortunately you cant just remove you have to set so i'm setting to the default without those 2
            // https://js.devexpress.com/Vue/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/columns/#filterOperations
            if (col.dataType === 'string') {
              col.filterOperations = ['contains', 'notcontains', 'startswith', 'endswith', '=', '<>', 'isblank', 'isnotblank'];
            } else if (col.dataType === 'boolean') {
              col.filterOperations = ['=', '<>', 'isblank', 'isnotblank'];
            } else {
              col.filterOperations = ['=', '<>', '<', '>', '<=', '>=', 'between', 'isblank', 'isnotblank'];
            }
        }
      }
    },

    calculateDateFilterForLocalDates(columnDef: Column, value: Date | Date[], selectedFilterOperation: string, target: string) {
      // based on https://supportcenter.devexpress.com/ticket/details/t570706/how-to-avoid-ignoring-the-local-time-when-filtering-dates-in-odata
      // gotta find the actual column (their "this") and ask for default filter for it
      // because dates allow for weird equals and stuff (ie: equal => between date and time and next minute)
      const filter = this.grid.instance.columnOption(columnDef.dataField).defaultCalculateFilterExpression(value, selectedFilterOperation, target);

      // this returns either an array where the dates (between) are params 0-2 and 2-2, or a date as last parameter, which we'll change the offset back to utc
      const getDateFilterAsUtc = (d: Date) => (d ? new Date(d.getTime() + d.getTimezoneOffset() * 60000) : d);
      if (filter) {
        if (Array.isArray(filter[0])) {
          filter[0][2] = getDateFilterAsUtc(filter[0][2]);
          filter[2][2] = getDateFilterAsUtc(filter[2][2]);
        } else {
          filter[2] = getDateFilterAsUtc(filter[2]);
        }
      }
      return filter;
    },

    /// shows the dialog if we need a name, else saves
    async saveQuery(doSaveAs = false, thenShare = false) {
      this.shareAfterSave = thenShare;
      if (doSaveAs || !this.query.id) {
        this.queryName = null;
        this.showSaveDialog = true;
      } else {
        await this.doSave();
      }
    },

    /// saves the current query
    async doSave(saveAs = false) {
      // HACK used when creating standard queries - just uncomment this, make your standard query and hit save.
      // then put the state from the console in standard_queries.ts.   ta-dah!
      // const state = this.grid?.instance?.state();
      // if (Array.isArray(state?.columns)) {
      //   state.columns = sortBy(state.columns, 'dataField');
      // }
      // console.log('state: ' + JSON.stringify(JSON.stringify(state)));
      // return;

      let query = _cloneDeep(this.query);
      if (saveAs) {
        query.id = null;
        query.name = this.queryName;
        query.queryType = QueryType.Custom;
      }
      if (query.owner == null) {
        query.owner = this.currentUserId;
      }
      query.state = window.btoa(JSON.stringify(this.grid?.instance?.state()));
      query = saveAs ? await this.$services.queries.create(query) : await this.$services.queries.edit(query);
      if (query) {
        this.$toasted.global.success(this.$t('reporting.query.save.success'));
        this.query = query;
      }
      this.showSaveDialog = false;

      if (this.shareAfterSave) {
        this.grid?.instance?.hideColumnChooser();
        this.showSelectUserDialog = true;
        this.shareAfterSave = false;
      }
    },

    async shareToUsers(selectedUsers: UserTeamMember[]) {
      if (!selectedUsers?.length) {
        return;
      }

      try {
        this.loading = true;
        const query = _cloneDeep(this.query);
        query.id = null;

        const promises = selectedUsers.map((u) => this.$services.queries.create({ ...query, owner: u.id }));

        await Promise.all(promises);

        this.$toasted.global.success(this.$t('reporting.query.share.share_confirmation', { x: selectedUsers.length }));
        this.showSelectUserDialog = false;
      } finally {
        this.loading = false;
      }
    },

    /// every time a new column is added or removed we get the new data since we have a different "select"
    handlePropertyChange(e: { name: string }) {
      if (e.name === 'columns') {
        this.refreshData();
      }
    },

    /// loads the data for the grid.  This checks for all visible columns to limit the number of columns requested (select)
    refreshData() {
      if (!this.grid?.instance?.getDataSource || !this.grid.instance.getDataSource()) {
        return;
      }

      const grid = this.grid.instance;

      for (let index = 0; index < grid.columnCount(); index += 1) {
        if (grid.columnOption(index, 'visible') !== grid.columnOption(index, 'allowSearch')) {
          const canAllowSearch = this.dsType.columns.find((c) => c.dataField === grid.columnOption(index, 'dataField')).allowSearch !== false;
          grid.columnOption(index, 'allowSearch', canAllowSearch && grid.columnOption(index, 'visible'));
        }
      }

      const cols = grid.getVisibleColumns().map((x) => x.dataField);

      const keys = Object.keys(this.dsType.key);
      keys.filter((k) => cols.indexOf(k) === -1).forEach((k) => {
        cols.push(k);
      });

      // sets the "select" to the list of correct columns
      grid.getDataSource().select(cols.filter((c) => c != null));
      grid.refresh();
    },

    /// when exporting to excel or csv
    async onExporting(e: { component: any }) {
      this.showExportDialog = true;
      const userChoice = await (this.$refs.exportDialog as any).open() as boolean;
      this.showExportDialog = false;
      if (!userChoice) {
        return;
      }
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Main sheet');
      exportDataGrid({
        component: e.component,
        worksheet,
        customizeCell(options) {
          options.excelCell.font = { name: 'Arial', size: 12 };
          options.excelCell.alignment = { horizontal: 'left' };
          if (options.gridCell.column.dataType === 'date' && (options.gridCell.column as ExtendedColumn).asUtcDate) {
            if (options.gridCell.value instanceof Date) {
              options.excelCell.value = helpers.getLocalStringDate(options.gridCell.value, 'Report.Export');
            }
          }
          },
      }).then(() => {
        // called after all the data has been downloaded by the grid
        if (this.exportMode !== 'csv') {
          workbook.xlsx.writeBuffer()
            .then((buffer) => {
              saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'DataGrid.xlsx');
            });
        } else {
          workbook.csv.writeBuffer().then((buffer) => {
            const BOM = '\uFEFF';
            const csvContent = BOM + buffer;
            saveAs(new Blob([csvContent], { type: 'text/csv;charset=utf-8' }), 'Report.csv');
          });
        }
      });
    },

    // needed in order to solve a11y issue "ARIA commands must have an accessible name"
    // https://dequeuniversity.com/rules/axe/4.8/aria-command-name?application=AxeChrome
    // this function has 1s delay in order to make sure all the elements of DxDataGrid have been rendered properly
    async setElementA11yAttributeWithDelay(delay = 1000) {
      await helpers.timeout(delay);
      libHelpers.setElementA11yAttribute('.dx-item.dx-menu-item.dx-menu-item-has-icon.dx-menu-item-has-submenu', 'aria-label', this.$t('common.search') as string);
      libHelpers.setElementA11yAttribute('.dx-widget.dx-state-readonly.dx-checkbox.dx-datagrid-checkbox-size', 'aria-label', 'checkbox');
    },
  },
});
</script>
<style scoped lang="scss">
::v-deep .grid-column {
  max-width: 40vw;
}

.grid-container {
  background-color: white;
}

.btn-header {
  background-color: var(--v-primary-lighten2) !important;
  color: var(--v-primary) !important;
}

::v-deep .wrapped-column {
  white-space: pre-line;
}

::v-deep .dx-group-panel-message {
  color: var(--v-grey-darken2) !important;
}

::v-deep .dx-datagrid-headers {
  color: var(--v-grey-darken2) !important;
}
</style>
