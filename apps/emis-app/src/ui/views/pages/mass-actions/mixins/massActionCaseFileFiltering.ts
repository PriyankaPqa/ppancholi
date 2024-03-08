import _isEmpty from 'lodash/isEmpty';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { ICaseFileCombined, ICaseFileEntity, ICaseFileMetadata, IdParams } from '@libs/entities-lib/case-file';
import { IAzureSearchParams } from '@libs/shared-lib/types';
import { MassActionType } from '@libs/entities-lib/mass-action';
import helpers from '@/ui/helpers/helpers';
import buildQuerySql from 'odata-query';
import EventsFilterMixin from '@/ui/mixins/eventsFilter';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { useCaseFileMetadataStore, useCaseFileStore } from '@/pinia/case-file/case-file';

export default mixins(TablePaginationSearchMixin, EventsFilterMixin).extend({
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      fetchAllCaseFileLoading: false,
      exportLoading: false,
      combinedCaseFileStore: new CombinedStoreFactory<ICaseFileEntity, ICaseFileMetadata, IdParams>(useCaseFileStore(), useCaseFileMetadataStore()),
      sqlSearchMode: true,
      lastFilter: null as IAzureSearchParams,
    };
  },

  computed: {
    filtersOn(): boolean {
      return !_isEmpty(this.userFilters) || !_isEmpty(this.userSearchFilters);
    },

    tableData(): ICaseFileCombined[] {
      return this.combinedCaseFileStore.getByIds(
        this.searchResultIds,
        { onlyActive: true },
      );
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: useCaseFileStore().searchLoading,
      };
    },
  },

  methods: {
    onCancel() {
      this.$emit('update:show', false);
    },

    onClose() {
      this.$emit('update:show', false);
    },

    async fetchData(params: IAzureSearchParams) {
      if (this.filtersOn) {
        this.lastFilter = { filter: params.filter };
        const res = await this.combinedCaseFileStore.search({
          search: params.search,
          filter: params.filter,
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        }, null, false, true);
        return res;
      }
      return { ids: [], count: 0 };
    },

    async onExport(massActionType: MassActionType) {
      this.exportLoading = true;

      const filter = buildQuerySql(CombinedStoreFactory.RemoveInactiveItemsFilterOdata(this.lastFilter, true) as any);

      const res = await this.$services.massActions.exportList(massActionType, {
        filter,
        search: null,
        language: this.$i18n.locale,
      });

      if (res) {
        helpers.downloadFile(res);
      }

      this.exportLoading = false;
    },
  },

  created() {
    this.fetchEventsFilter();
  },
});
