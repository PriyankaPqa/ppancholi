<template>
  <div class="pa-4">
    <rc-data-table
      data-test="appointment-programs"
      :items="tableData"
      :count="itemsCount"
      :show-help="false"
      :labels="labels"
      :headers="headers"
      :table-props="tableProps"
      :footer-text="footerText"
      :options.sync="options"
      :initial-search="params && params.search"
      :custom-columns="Object.values(customColumns)"
      show-add-button
      @add-button="addAppointment"
      @search="search">
      <template #[`item.${customColumns.name}`]="{ item: program }">
        <router-link
          class="rc-link14 font-weight-bold pr-1"
          :data-test="`appointmentProgramDetail-link-${program.id}`"
          :to="getAppointmentProgramDetailsRoute(program)">
          {{ (program && $m(program.name)) || '-' }}
        </router-link>
      </template>

      <template #[`item.${customColumns.appointmentProgramStatus}`]="{ item: program }">
        <status-chip v-if="(program && program.appointmentProgramStatus)" status-name="Status" :status="program.appointmentProgramStatus" />
      </template>

      <template #[`item.${customColumns.edit}`]="{ item: program }">
        <v-btn icon :to="getAppointmentProgramEditRoute(program)" :aria-label="$t('common.edit')" data-test="editAppointmentProgram-link">
          <v-icon>
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>

      <template #[`item.${customColumns.delete}`]="{ item: program }">
        <v-btn icon :aria-label="$t('common.delete')" data-test="deleteProgram" @click="deleteAppointmentProgram(program)">
          <v-icon>
            mdi-delete
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
import { EFilterKeyType } from '@libs/component-lib/types';
import routes from '@/constants/routes';
import { FilterKey } from '@libs/entities-lib/user-account';
import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { ISearchParams } from '@libs/shared-lib/types';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import { IAppointmentProgram } from '@libs/entities-lib/appointment';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';

export default mixins(TablePaginationSearchMixin).extend({
  name: 'AppointmentProgramsHome',

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
        appointmentProgramStatus: 'appointmentProgramStatus',
        edit: 'edit',
        delete: 'delete',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('common.name') as string,
          sortable: true,
          value: this.customColumns.name,
          width: '80%',
        },
        {
          text: this.$t('common.status') as string,
          sortable: false,
          value: this.customColumns.appointmentProgramStatus,
        },
        {
          text: this.$t('common.edit') as string,
          class: 'rc-transparent-text',
          sortable: false,
          value: this.customColumns.edit,
          align: 'end',
          width: '5%',
        },
        {
          text: this.$t('common.delete') as string,
          class: 'rc-transparent-text',
          sortable: false,
          value: this.customColumns.delete,
          width: '5%',
        },
      ];
    },

    labels(): Record<string, unknown> {
      return {
        header: {
          title: this.$t('appointmentPrograms.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('appointmentPrograms.addProgram'),
        },
      };
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: useAppointmentProgramStore().searchLoading,
        itemClass: (item: { pinned: boolean }) => (item.pinned ? 'pinned' : ''),
      };
    },

    tableData(): IAppointmentProgram[] {
      return useAppointmentProgramStore().getByIdsWithPinnedItems(
        this.searchResultIds,
        { baseDate: this.searchExecutionDate, parentId: { eventId: this.id }, onlyActive: true },
      );
    },

  },

  created() {
    this.saveState = true;
    this.loadState();
  },

  methods: {
    async fetchData(params: ISearchParams) {
      const filter = _isEmpty(params.filter) ? {} : params.filter as Record<string, unknown>;
      try {
        const res = await useAppointmentProgramStore().search({ params: {
          filter: { 'Entity/EventId': { value: this.id, type: EFilterKeyType.Guid }, ...filter },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
        },
        includeInactiveItems: false });
        return res;
      } finally {
        useAppointmentProgramStore().searchLoading = false;
      }
    },

    addAppointment() {
      this.$router.push({
        name: routes.events.appointmentPrograms.create.name,
      });
    },

    getAppointmentProgramDetailsRoute(program: IAppointmentProgram) {
      return {
        name: routes.events.appointmentPrograms.details.name,
        params: {
          appointmentProgramId: program.id,
        },
      };
    },

    getAppointmentProgramEditRoute(program: IAppointmentProgram) {
      return {
        name: routes.events.appointmentPrograms.edit.name,
        params: {
          appointmentProgramId: program.id,
        },
      };
    },

    async deleteAppointmentProgram(program: IAppointmentProgram) {
      const doDelete = await this.$confirm({
        title: this.$t('appointmentPrograms.confirm.delete.title'),
        messages: this.$t('appointmentPrograms.confirm.delete.message'),
      });

      if (doDelete) {
        await useAppointmentProgramStore().deactivate(program.id);
      }
    },
  },
});
</script>

<style scoped lang="scss">

::v-deep .v-data-table > .v-data-table__wrapper tbody tr:not(.v-data-table__expanded) td:nth-last-child(1),
::v-deep .v-data-table > .v-data-table__wrapper tbody tr:not(.v-data-table__expanded) td:nth-last-child(2){
    padding:0;
}

</style>
