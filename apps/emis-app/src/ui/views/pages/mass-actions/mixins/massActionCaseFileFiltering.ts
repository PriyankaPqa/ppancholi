import _isEmpty from 'lodash/isEmpty';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { ICaseFileCombined } from '@libs/entities-lib/case-file';
import { IAzureSearchParams } from '@libs/core-lib/types';
import { MassActionType } from '@libs/entities-lib/mass-action';
import helpers from '@/ui/helpers/helpers';
import { buildQuery } from '@libs/core-lib/services/odata-query';
import EventsFilterMixin from '@/ui/mixins/eventsFilter';

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
    };
  },

  computed: {
    filtersOn(): boolean {
      return !_isEmpty(this.userFilters) || !_isEmpty(this.userSearchFilters);
    },

    tableData(): ICaseFileCombined[] {
      return this.$storage.caseFile.getters.getByIds(this.searchResultIds,
        { onlyActive: true });
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: this.$store.state.caseFileEntities.searchLoading,
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
        const res = await this.$storage.caseFile.actions.search({
          search: params.search,
          filter: params.filter,
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        });
        return res;
      }
      return { ids: [], count: 0 };
    },

    async onExport(massActionType: MassActionType) {
      this.exportLoading = true;

      const filter = buildQuery({ filter: this.azureSearchParams.filter }).replace('?$filter=', '');

      const res = await this.$services.massActions.exportList(massActionType, {
        filter: `${filter} and Entity/Status eq 1`,
        search: this.azureSearchParams.search,
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
