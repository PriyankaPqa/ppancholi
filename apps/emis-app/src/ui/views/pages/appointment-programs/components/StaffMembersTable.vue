<!-- INCOMPLETE COMPONENT -->
<template>
  <div>
    <div class="table_top_header border-radius-top no-bottom-border">
      <v-btn
        color="primary"
        data-test="add-staff-member"
        :disabled="!serviceOptions.length"
        @click="showManageStaffDialog = true">
        {{ isEditMode ? $t('appointmentProgram.staffMembers.table.manageStaff') : $t('appointmentProgram.staffMembers.table.addStaff') }}
      </v-btn>
    </div>
    <v-data-table-a11y
      :class="{ 'table border-radius-bottom': true, loading }"
      data-test="staffMembers__table"
      must-sort
      :loading="loading"
      :headers="headers"
      :options.sync="options"
      :items="staffMembers">
      <template #[`item.${customColumns.name}`]="{ item }">
        <span data-test="staffMembers__name">{{ item.displayName }}</span>
      </template>

      <template #[`item.${customColumns.role}`]="{ item }">
        <span data-test="staffMembers__role"> {{ $m(item.roleName) }} </span>
      </template>

      <template #[`item.${customColumns.serviceOption}`]="{ item }">
        <span data-test="staffMembers__serviceOption"> {{ getServiceOptionNames(item.id) }} </span>
      </template>
    </v-data-table-a11y>

    <manage-staff-members
      v-if="showManageStaffDialog"
      :show.sync="showManageStaffDialog"
      :event-id="eventId"
      :is-edit-mode="isEditMode"
      :service-options="serviceOptions"
      :appointment-program-id="appointmentProgramId"
      :initial-staff-members.sync="staffMembers"
      @submit="onUpdateStaffMembers" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import { VDataTableA11y } from '@libs/component-lib/components';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { IAppointmentProgram, IServiceOption } from '@libs/entities-lib/appointment';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';
import ManageStaffMembers from './ManageStaffMembers.vue';

export default Vue.extend({
  name: 'StaffMembersTable',

  components: {
    VDataTableA11y,
    ManageStaffMembers,
  },

  props: {
    appointmentProgramId: {
      type: String,
      required: true,
    },

    eventId: {
      type: String,
      default: '',
    },

    serviceOptions: {
      type: Array as ()=> IServiceOption[],
      required: true,
    },
        /**
     * Is the appointment program being created or edited
     */
     isEditMode: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      options: {
        page: 1,
        sortBy: ['displayName'],
      },
      showManageStaffDialog: false,
      loading: false,
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        name: 'displayName',
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

    serviceOptionTypes(): IOptionItem[] {
      return useAppointmentProgramStore().getServiceOptionTypes(this.serviceOptions.map((o) => o.serviceOptionType?.optionItemId));
    },

    staffMemberIds(): string[] {
      const allIds = this.serviceOptions.reduce((ids, so) => {
        if (so.staffMembers?.length) {
          ids.push(...so.staffMembers);
        }
        return ids;
      }, []);

      return [...new Set(allIds)];
    },

    staffMembers(): IUserAccountMetadata[] {
      return useUserAccountMetadataStore().getByIds(this.staffMemberIds);
    },
  },

  watch: {
    staffMemberIds(newValue) {
      useUserAccountMetadataStore().fetchByIds(newValue, true);
    },
  },

  async created() {
    await useAppointmentProgramStore().fetchServiceOptionTypes();
    await useUserAccountMetadataStore().fetchByIds(this.staffMemberIds, true);
  },

  methods: {
    // The appointment program is being created, the staff members are being added to the payload
    onUpdateStaffMembers(serviceOptions: IServiceOption[]) {
      this.$emit('update:serviceOptions', serviceOptions);
    },

    getServiceOptionNames(memberId: string): string {
      const serviceOptionsContainingMember = this.serviceOptions.filter((so) => so.staffMembers.includes(memberId));
      const serviceOptionTypes = this.serviceOptionTypes.filter((t) => serviceOptionsContainingMember.map((so) => so.serviceOptionType.optionItemId).includes(t.id));
      return serviceOptionTypes.map((t) => this.$m(t.name)).sort((a, b) => a.localeCompare(b)).join(', ');
    },
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
