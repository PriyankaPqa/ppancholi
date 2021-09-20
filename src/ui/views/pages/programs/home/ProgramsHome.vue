<template>
  <div class="pa-4">
    <rc-data-table
      data-test="programs-table"
      :items="programs"
      :count="count"
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
        <status-chip status-name="Status" :status="program.status" />
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
import { IProgramEntity } from '@/entities/program';

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
        sortBy: [`Entity/Name/Translation/${this.$i18n.locale}`],
        sortDesc: [true],
      },
      count: 0,
      programs: [] as IProgramEntity[],
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        name: `Entity/Name/Translation/${this.$i18n.locale}`,
        status: 'Entity/Status',
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
        loading: this.$store.state.programEntities.searchLoading,
      };
    },
  },

  methods: {
    async fetchData(params: IAzureSearchParams) {
      params.filter = {
        'Entity/EventId': this.id,
      };
      const res = await this.$storage.program.actions.search({
        search: params.search,
        filter: params.filter,
        top: params.top,
        skip: params.skip,
        orderBy: params.orderBy,
        count: true,
        queryType: 'full',
        searchMode: 'all',
      }, null, true);

      this.count = res.count;
      this.programs = this.$storage.program.getters.getByIds(res.ids).map((combined) => combined.entity);

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
