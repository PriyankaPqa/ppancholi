import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import moment from 'moment';
import { TranslateResult } from 'vue-i18n';
import {
  IMassActionCombined, IMassActionRun, IMassActionRunMetadataModel, MassActionRunStatus,
} from '@/entities/mass-action';
import { IAzureSearchParams } from '@/types';
import { Status } from '@/entities/base';

export default Vue.extend({

  data() {
    return {
      moment,
      options: {
        page: 1,
        sortBy: ['Entity/Created'],
        sortDesc: [true],
      },
      massActionTypeData: null,
      detailsRouteNameData: '',
      searchEndpointData: '',
      tableTitleData: '',
      addButtonLabelData: '',
      searchResultIds: [],
      itemsCount: 0,
      searchExecutionDate: null as Date,
    };
  },

  computed: {
    tableData(): IMassActionCombined[] {
      return this.$storage.massAction.getters.getByIds(this.searchResultIds,
        { onlyActive: true, prependPinnedItems: true, baseDate: this.searchExecutionDate });
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: this.$store.state.massActionEntities.searchLoading,
        itemClass: (item: IMassActionCombined) => (item.pinned ? 'pinned' : ''),
      };
    },

    labels(): { header: { title: TranslateResult; searchPlaceholder: TranslateResult, addButtonLabel: TranslateResult } } {
      return {
        header: {
          title: `${this.$t(this.tableTitleData)} (${this.itemsCount})`,
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t(this.addButtonLabelData),
        },
      };
    },
  },

  methods: {
    goToDetails(id: string) {
      return {
        name: this.detailsRouteNameData,
        params: {
          id,
        },
      };
    },

    async onDelete(massAction: IMassActionCombined) {
      const userChoice = await this.$confirm(this.$t('massAction.confirm.delete.title'), this.$t('massAction.confirm.delete.message'));
      if (userChoice) {
        const res = await this.$storage.massAction.actions.deactivate(massAction.entity.id);
        if (res) {
          this.$toasted.global.success(this.$t('massAction.delete.success'));
          this.itemsCount -= 1;
        }
      }
    },

    getLastRunEntity(massAction: IMassActionCombined): IMassActionRun {
      return _orderBy(massAction.entity.runs, 'timestamp', 'desc')[0];
    },

    getLastRunMetadata(massAction: IMassActionCombined): IMassActionRunMetadataModel {
      return massAction?.metadata.lastRun;
    },

    isPreprocessing(massAction: IMassActionCombined) {
      return this.getLastRunEntity(massAction).runStatus === MassActionRunStatus.PreProcessing;
    },

    isPreprocessed(massAction: IMassActionCombined) {
      return this.getLastRunEntity(massAction).runStatus === MassActionRunStatus.PreProcessed;
    },

    showDeleteIcon(massAction: IMassActionCombined) {
      return this.isPreprocessing(massAction) || this.isPreprocessed(massAction);
    },

    async fetchData(params: IAzureSearchParams) {
      const res = await this.$storage.massAction.actions.search({
        search: params.search,
        filter: {
          ...params.filter as Record<string, unknown>,
          Entity: {
            Status: Status.Active,
            Type: this.massActionTypeData,
          },
        },
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      }, this.searchEndpointData);

      return res;
    },
  },
});
