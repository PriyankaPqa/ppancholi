<!-- INCOMPLETE COMPONENT -- DO NOT REVIEW -->
<!--  -->
<!--  -->
<template>
  <div class="pa-4">
    <rc-data-table
      data-test="case-file-appointments-table"
      :items="tableData"
      :count="itemsCount"
      :table-props="tableProps"
      :show-help="false"
      :labels="labels"
      :headers="headers"
      :footer-text="footerText"
      :options.sync="options"
      :initial-search="params && params.search"
      :custom-columns="Object.values(customColumns)"
      :hide-footer="true"
      :show-add-button="canAdd"
      @add-button="addAppointment"
      @search="search">
      <template #filter>
        <filter-toolbar
          :filter-key="FilterKey.Appointment"
          :count="itemsCount"
          :initial-filter="filterState"
          :filter-options="filters"
          @update:appliedFilter="onApplyFilter" />
      </template>
      <template #[`item.${customColumns.name}`]="{ item }">
        <router-link
          class="rc-link14 font-weight-bold pr-1"
          :data-test="`appointmentDetail-link-${item.id}`"
          :to="getDetailsRoute(item.id)">
          {{ (item && item.name) || '-' }}
        </router-link>
      </template>
    </rc-data-table>
  </div>
</template>

<script lang="ts">
import { DataTableHeader } from 'vuetify';
import {
  RcDataTable,
} from '@libs/component-lib/components';
import { IFilterSettings } from '@libs/component-lib/types/FilterTypes';
import mixins from 'vue-typed-mixins';
import TablePaginationSearchMixin from '@/ui/mixins/tablePaginationSearch';
import routes from '@/constants/routes';
import { FilterKey } from '@libs/entities-lib/user-account';

import FilterToolbar from '@/ui/shared-components/FilterToolbar.vue';
import { IAppointment } from '@libs/entities-lib/appointment';
import { useAppointmentStore } from '@/pinia/appointment/appointment';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { UserRoles } from '@libs/entities-lib/user';
import caseFileDetail from '../caseFileDetail';

export default mixins(TablePaginationSearchMixin, caseFileDetail).extend({
  name: 'CaseFileAppointments',

  components: {
    RcDataTable,
    FilterToolbar,
  },

  data() {
    return {
      FilterKey,
      options: {
        sortBy: ['Entity/Name'],
        sortDesc: [false],
      },
    };
  },

  computed: {
    canAdd(): boolean {
      return (this.caseFile.caseFileStatus === CaseFileStatus.Open || this.caseFile.caseFileStatus === CaseFileStatus.Inactive)
      && (this.$hasLevel(UserRoles.level1) || (this.$hasLevel(UserRoles.level0) && this.event.appointmentBookingForL0usersEnabled));
    },

    customColumns(): Record<string, string> {
      return {
        name: 'Entity/Name',
        edit: 'edit',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('common.name') as string,
          sortable: true,
          value: this.customColumns.name,
        },

        {
          text: this.$t('common.edit') as string,
          class: 'rc-transparent-text',
          sortable: false,
          value: this.customColumns.edit,
        },
      ];
    },

    labels(): Record<string, unknown> {
      return {
        header: {
          title: this.$t('caseFile.appointments.title'),
          searchPlaceholder: this.$t('common.inputs.quick_search'),
          addButtonLabel: this.$t('caseFile.appointments.addAppointment'),
        },
      };
    },

    filters(): Array<IFilterSettings> {
      return [

      ];
    },

    tableProps(): Record<string, unknown> {
      return {
        loading: useAppointmentStore().searchLoading,
        itemClass: (item: IAppointment) => (item.pinned ? 'pinned' : ''),
      };
    },

    tableData(): IAppointment[] {
      return [];
    },

  },

  async created() {
    this.saveState = true;
    this.loadState();
  },

  methods: {
    addAppointment() {
      this.$router.push({
        name: routes.caseFile.appointments.add.name,
      });
    },

    getDetailsRoute(id: string) {
      return {
        name: routes.caseFile.appointments.details.name,
        params: {
          appointmentId: id,
        },
      };
    },

    getEditRoute(id: string) {
      return {
        name: routes.caseFile.appointments.edit.name,
        params: {
          appointmentId: id,
        },
      };
    },

    async fetchData() {
      return null;
    },
  },
});
</script>
