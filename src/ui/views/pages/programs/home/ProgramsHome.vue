<template>
  <div class="pa-4">
    <rc-data-table
      data-test="programs-table"
      :items="azureSearchItems"
      :count="azureSearchCount"
      :show-help="true"
      :help-link="$t('zendesk.help_link.view_programs_list')"
      :labels="labels"
      :headers="headers"
      :table-props="tableProps"
      :options.sync="options"
      :custom-columns="Object.values(customColumns)"
      show-add-button
      @add-button="addProgram"
      @search="search">
      <template #[`item.${customColumns.name}`]="{ item: program }">
        <router-link
          class="rc-link14 font-weight-bold pr-1"
          data-test="programDetail-link"
          :to="getProgramDetailsRoute(program)">
          {{ $m(program.name) }}
        </router-link>
      </template>

      <template #[`item.${customColumns.status}`]="{ item: program }">
        <status-chip status-name="EProgramStatus" :status="program.programStatus" />
      </template>

      <template #[`item.${customColumns.edit}`]="{ item: program }">
        <v-btn icon :to="getProgramEditRoute(program)" data-test="editProgram-link">
          <v-icon>
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import {
  RcDataTable,
} from '@crctech/component-library';
import routes from '@/constants/routes';
import { IAzureSearchParams } from '@/types';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { IProgram } from '@/entities/program';

export default Vue.extend({
  name: 'ProgramsHome',

  components: {
    RcDataTable,
    StatusChip,
  },

  mixins: [TablePaginationSearchMixin],

  props: {
    // showFiltersBar: {
    //   type: Boolean,
    //   default: false,
    // },
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      options: {
        page: 1,
        sortBy: [`ProgramName/Translation/${this.$i18n.locale}`],
        sortDesc: [true],
      },
      loading: false,
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        name: `ProgramName/Translation/${this.$i18n.locale}`,
        status: `ProgramStatusName/Translation/${this.$i18n.locale}`,
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
        },
      };
    },

    tableProps(): Record<string, boolean> {
      return {
        loading: this.loading,
      };
    },
  },

  methods: {
    async fetchData(params: IAzureSearchParams) {
      this.loading = true;

      try {
        params.filter = `EventId eq '${this.id}'`;
        const res = await this.$storage.program.actions.searchPrograms({
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
      } finally {
        this.loading = false;
      }
    },

    addProgram() {
      this.$router.push({
        name: routes.programs.create.name,
      });
    },

    getProgramDetailsRoute(program: IProgram) {
      return {
        name: routes.programs.details.name,
        params: {
          programId: program.id,
        },
      };
    },

    getProgramEditRoute(program: IProgram) {
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
