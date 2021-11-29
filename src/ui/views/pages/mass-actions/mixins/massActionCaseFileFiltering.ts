import _isEmpty from 'lodash/isEmpty';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { ICaseFileCombined } from '@/entities/case-file';
import { IAzureCombinedSearchResult, IAzureSearchParams } from '@/types';
import { EEventStatus, IEventEntity, IEventMetadata } from '@/entities/event';
import buildQuery from '@/services/odata-query';
import { MassActionType } from '@/entities/mass-action';
import helpers from '@/ui/helpers/helpers';

export default mixins(TablePaginationSearchMixin).extend({
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      fetchAllCaseFileLoading: false,
      eventsFilterLoading: false,
      eventsFilter: [],
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

    async fetchEventsFilter() {
      this.eventsFilterLoading = true;

      const params = {
        filter: {
          or: [
            {
              Entity: {
                Schedule: {
                  Status: EEventStatus.Open,
                },
              },
            },
            {
              Entity: {
                Schedule: {
                  Status: EEventStatus.OnHold,
                },
              },
            },
          ],
        },
        select: ['Entity/Name', 'Entity/Id'],
        top: 999,
        orderBy: `Entity/Name/Translation/${this.$i18n.locale} asc`,
        queryType: 'full',
        searchMode: 'all',
      };

      const res = await this.$services.events.search(params) as IAzureCombinedSearchResult<IEventEntity, IEventMetadata>;

      this.eventsFilterLoading = false;

      if (res?.value) {
        this.eventsFilter = res.value.map((e) => ({
          text: this.$m(e.entity.name),
          value: e.entity.id,
        }));
      }
    },

    async onExport(massActionType: MassActionType) {
      this.exportLoading = true;

      const filter = buildQuery({ filter: this.azureSearchParams.filter }).replace('?$filter=', '');

      const res = await this.$services.massActions.exportList(massActionType, {
        filter,
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
