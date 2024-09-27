<template>
  <div :class="{ disabled }">
    <div class="table_top_header border-radius-top no-bottom-border">
      <v-btn
        small
        data-test="add-staff-member-btn"
        :disabled="!serviceOptions.length"
        @click="showManageStaffDialog = true">
        {{ $t('appointmentProgram.staffMembers.table.manageStaff') }}
      </v-btn>
    </div>
    <v-data-table-a11y
      :class="{ 'table border-radius-bottom': true, loading }"
      data-test="staffMembers__table"
      must-sort
      :loading="loading"
      :headers="headers"
      :options.sync="options"
      :items="users">
      <template #[`item.${customColumns.name}`]="{ item }">
        <span data-test="staffMembers__name">{{ item.displayName }}</span>
      </template>

      <template #[`item.${customColumns.role}`]="{ item }">
        <span data-test="staffMembers__role"> {{ $m(item.roleName) }} </span>
      </template>

      <template #[`item.${customColumns.serviceOption}`]="{ item }">
        <span data-test="staffMembers__serviceOption"> {{ getServiceOptionNames(item.id) }} </span>
      </template>

      <template #[`item.${customColumns.delete}`]="{ item }">
        <v-btn icon data-test="serviceOption__delete" :aria-label="$t('common.delete')" @click="removeStaffMember(item.id)">
          <v-icon size="24" color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </v-data-table-a11y>

    <manage-staff-members
      v-if="showManageStaffDialog"
      :show.sync="showManageStaffDialog"
      :event-id="eventId"
      :service-options="serviceOptions"
      :appointment-program-id="appointmentProgramId"
      :initial-staff-members="staffMembers" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import { VDataTableA11y } from '@libs/component-lib/components';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { IAppointmentStaffMember, IServiceOption } from '@libs/entities-lib/appointment';
import { useUserAccountMetadataStore } from '@/pinia/user-account/user-account';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useAppointmentStaffMemberStore } from '@/pinia/appointment-staff-member/appointment-staff-member';
import { EFilterKeyType } from '@libs/component-lib/types';
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

     disabled: {
      type: Boolean,
      default: false,
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
        delete: 'delete',
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
        {
          text: this.$t('common.delete') as string,
          class: 'rc-transparent-text',
          sortable: false,
          value: this.customColumns.delete,
          width: '5%',
        },
      ];
    },

    serviceOptionTypes(): IOptionItem[] {
      return useAppointmentProgramStore().getServiceOptionTypes(this.serviceOptions.map((o) => o.serviceOptionType?.optionItemId));
    },

    staffMembers(): Partial<IAppointmentStaffMember>[] {
      return useAppointmentStaffMemberStore().getByAppointmentProgramId(this.appointmentProgramId);
    },

    userAccountIds(): string[] {
      return this.staffMembers.map((m) => m.userAccountId);
    },

    users(): IUserAccountMetadata[] {
      return useUserAccountMetadataStore().getByIds(this.userAccountIds);
    },
  },

  watch: {
    userAccountIds(newValue) {
      useUserAccountMetadataStore().fetchByIds(newValue, true);
    },
  },

  async created() {
    if (!this.disabled) {
      this.loading = true;
      await useAppointmentProgramStore().fetchServiceOptionTypes();
      await this.fetchStaffMembers();
      await useUserAccountMetadataStore().fetchByIds(this.userAccountIds, true);
      this.loading = false;
    }
  },

  methods: {
    getServiceOptionNames(userId: string): string {
      const userServiceOptionsIds = this.staffMembers.find((m) => m.userAccountId === userId)?.serviceOptionIds;
      const userServiceOptions = this.serviceOptions.filter((so) => userServiceOptionsIds?.includes(so.id));
      const serviceOptionTypes = this.serviceOptionTypes.filter((t) => userServiceOptions.map((so) => so.serviceOptionType.optionItemId).includes(t.id));
      return serviceOptionTypes.map((t) => this.$m(t.name)).sort((a, b) => a.localeCompare(b)).join(', ');
    },

    async fetchStaffMembers() {
      await useAppointmentStaffMemberStore().search({ params: {
        filter: { 'Entity/AppointmentProgramId': { value: this.appointmentProgramId, type: EFilterKeyType.Guid } },
        skip: 0,
      } });
    },

    async removeStaffMember(userId: string) {
        const userChoice = await this.$confirm({
          title: this.$t('appointmentProgram.staffMember.confirm.delete.title'),
          messages: this.$t('appointmentProgram.staffMember.confirm.delete.message'),
         });

        if (userChoice) {
         const payload = [{ userAccountId: userId, serviceOptionIds: [] }] as Partial<IAppointmentStaffMember>[];
          const res = await useAppointmentStaffMemberStore().assignStaffMembers(this.appointmentProgramId, payload);
          if (res) {
            this.$toasted.global.success(this.$t('appointmentProgram.staffMember.updated.success'));
          } else {
            this.$toasted.global.error(this.$t('appointmentProgram.staffMember.updated.failed'));
          }
        }
    },
  },
});

</script>

<style scoped lang="scss">

.table_top_header {
  border: solid 1px var(--v-grey-lighten2);
  padding: 8px 16px;
  background: var(--v-grey-lighten4);
}

.table {
  border: solid 1px var(--v-grey-lighten2);
}

.no-bottom-border {
  border-bottom: none;
}

.disabled {
  opacity: 50%
}
</style>
