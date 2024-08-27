<template>
  <div>
    <div class="table_top_header border-radius-top no-bottom-border">
      <v-btn color="primary" data-test="add-staff-member" @click="showAddStaffMembersDialog = true">
        {{ $t('appointmentProgram.staffMembers.table.addStaff') }}
      </v-btn>
    </div>
    <v-data-table-a11y
      :class="{ 'table border-radius-bottom': true, loading }"
      data-test="staffMembers__table"
      must-sort
      hide-default-footer
      :loading="loading"
      :headers="headers"
      :items="staffMembers"
      @update:sort-by="sortBy = $event"
      @update:sort-desc="sortDesc = $event">
      <template #[`item.${customColumns.name}`]="{ item }">
        <span data-test="staffMembers__name">{{ item.name }}</span>
      </template>

      <template #[`item.${customColumns.role}`]="{ item }">
        <span data-test="staffMembers__role"> {{ item.role }} </span>
      </template>

      <template #[`item.${customColumns.serviceOption}`]="{ item }">
        <span data-test="staffMembers__serviceOption"> {{ item.serviceOption }} </span>
      </template>
    </v-data-table-a11y>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import { VDataTableA11y } from '@libs/component-lib/components';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { IAppointmentProgram } from '@libs/entities-lib/appointment';

export default Vue.extend({
  name: 'StaffMembersTable',

  components: {
    VDataTableA11y,
  },

  props: {
    appointmentProgramId: {
      type: String,
      required: true,
    },

  },

  data() {
    return {
      sortDesc: false,
      sortBy: 'metadata.displayName',
      showAddStaffMembersDialog: false,
      loading: false,
      staffMembers: [],
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        name: 'name',
        role: 'role',
        serviceOption: 'serviceOption',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('appointmentProgram.staffMembers.table.name') as string,
          filterable: false,
          sortable: true,
          value: this.customColumns.name,
        },
        {
          text: this.$t('appointmentProgram.staffMembers.table.role') as string,
          filterable: false,
          sortable: false,
          value: this.customColumns.role,
        },
        {
          text: this.$t('appointmentProgram.staffMembers.table.serviceOption') as string,
          filterable: false,
          sortable: false,
          value: this.customColumns.serviceOption,
        },
      ];
    },

    appointmentProgram(): IAppointmentProgram {
      return useAppointmentProgramStore().getById(this.appointmentProgramId);
    },

  },

  methods: {

  },
});

</script>

<style scoped lang="scss">

.table_top_header {
  border: solid 1px var(--v-grey-lighten2);
  padding: 10px 15px;
}

.table {
  border: solid 1px var(--v-grey-lighten2);
}

.no-bottom-border {
  border-bottom: none;
}
</style>
