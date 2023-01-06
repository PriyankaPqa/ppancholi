<template>
  <div class="pa-4">
    <rc-data-table
      data-test="programs-table"
      :items="tableData"
      :count="itemsCount"
      :show-help="false"
      :help-link="$t('zendesk.help_link.view_programs_list')"
      :labels="labels"
      :headers="headers"
      :footer-text="footerText"
      :table-props="tableProps"
      :options.sync="options"
      :initial-search="params && params.search"
      :custom-columns="Object.values(customColumns)"
      show-add-button
      @add-button="addProgram"
      @search="search">
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.EventPrograms"
          :filter-options="filterOptions"
          :initial-filter="filterState"
          add-filter-label="programs.filter"
          :count="itemsCount"
          @update:appliedFilter="onApplyFilter" />
      </template>

      <template #[`item.${customColumns.name}`]="{ item: program }">
        <router-link
          class="rc-link14 font-weight-bold pr-1"
          data-test="programDetail-link"
          :to="getProgramDetailsRoute(program.entity)">
          {{ (program.entity && $m(program.entity.name)) || '-' }}
        </router-link>
      </template>

      <template #[`item.${customColumns.status}`]="{ item: program }">
        <status-chip v-if="(program.entity && program.entity.status)" status-name="Status" :status="program.entity.status" />
      </template>

      <template #[`item.${customColumns.edit}`]="{ item: program }">
        <v-btn icon :to="getProgramEditRoute(program.entity)" data-test="editProgram-link">
          <v-icon>
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify';
import {
  RcDataTable,
} from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import _isEmpty from 'lodash/isEmpty';
import { EFilterType, IFilterSettings } from '@libs/component-lib/types';
import routes from '@/constants/routes';
import { FilterKey } from '@libs/entities-lib/user-account';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { IAzureSearchParams } from '@libs/shared-lib/types';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { IProgramCombined, IProgramEntity } from '@libs/entities-lib/program';
import helpers from '@/ui/helpers/helpers';
import { Status } from '@libs/entities-lib/base';

export default mixins(TablePaginationSearchMixin).extend({
  name: 'ProgramsHome',

  components: {
    RcDataTable,
    StatusChip,
    FilterToolbar,
  },

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      options: {
        page: 1,
        sortBy: [`Entity/Name/Translation/${this.$i18n.locale}`],
        sortDesc: [true],
      },
      FilterKey,
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        name: `Entity/Name/Translation/${this.$i18n.locale}`,
        status: `Metadata/ProgramStatusName/Translation/${this.$i18n.locale}`,
        edit: 'edit',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('common.name') as string,
          sortable: true,
          value: this.customColumns.name,
          width: '100%',
        },
        {
          text: this.$t('common.status') as string,
          sortable: true,
          value: this.customColumns.status,
          width: '100px',
        },
        {
          text: '',
          sortable: false,
          value: this.customColumns.edit,
        },
      ];
    },

    labels(): Record<string, unknown> {
      return {
        header: {
          title: this.$t('programs.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('programs.addProgram'),
        },
      };
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: this.$store.state.programEntities.searchLoading,
        itemClass: (item: { pinned: boolean }) => (item.pinned ? 'pinned' : ''),
      };
    },

    tableData(): IProgramCombined[] {
      return this.$storage.program.getters.getByIds(
        this.searchResultIds,
        { prependPinnedItems: true, baseDate: this.searchExecutionDate, parentId: { eventId: this.id } },
      );
    },

    filterOptions(): Array<IFilterSettings> {
      return [
        {
          key: this.customColumns.name,
          type: EFilterType.Text,
          label: this.$t('common.name') as string,
        },
        {
          key: this.customColumns.status,
          type: EFilterType.MultiSelect,
          label: this.$t('common.status') as string,
          items: helpers.enumToTranslatedCollection(Status, 'enums.Status', true),
        },
      ];
    },
  },

  created() {
    this.saveState = true;
    this.loadState();
  },

  methods: {
    async fetchData(params: IAzureSearchParams) {
      const filter = _isEmpty(params.filter) ? {} : params.filter;

      const res = await this.$storage.program.actions.search({
        search: params.search,
        filter: { ...filter as Record<string, unknown>, 'Entity/EventId': this.id },
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      }, null, true);

      return res;
    },

    addProgram() {
      this.$router.push({
        name: routes.programs.create.name,
      });
    },

    getProgramDetailsRoute(program: IProgramEntity) {
      return {
        name: routes.programs.details.name,
        params: {
          programId: program.id,
        },
      };
    },

    getProgramEditRoute(program: IProgramEntity) {
      return {
        name: routes.programs.edit.name,
        params: {
          programId: program.id,
        },
      };
    },
  },
});
</script>
