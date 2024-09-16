<template>
  <v-sheet rounded outlined class="ma-0 assign-table" height="100%" :loading="loading">
    <v-data-table-a11y
      data-test="assign-service-options__table"
      :headers="headers"
      :loading="loading"
      :class="{ 'in-program': !inTeamManagement }"
      dense
      :options.sync="options"
      :items="users">
      <template v-if="users.length" #body="props">
        <tr v-for="item in props.items" :key="item.id">
          <td>
            <div class="d-flex flex-column px-4 no-wrap" :class="inTeamManagement ? 'py-2' : 'py-1'">
              <span class="rc-body14 fw-bold">  {{ item.displayName }} </span>
              <span v-if="!inTeamManagement" class="rc-body12">  {{ getTeamNames(item) || '-' }} </span>
            </div>
          </td>
          <td v-for="so in serviceOptions" :key="so.id || so.tempId" class="checkbox-cell">
            <v-simple-checkbox
              :data-test="`assign_service_option_${so.id}_${item.id || item.tempId}`"
              :ripple="false"
              :value=" isMemberAssigned(so.id || so.tempId, item.id)"
              @input="onCheckAssign({ memberId: item.id, soId: so.id || so.tempId, value: $event })" />
          </td>
          <td v-if="!inTeamManagement" class="checkbox-cell">
            <rc-tooltip bottom>
              <template #activator="{ on }">
                <v-btn
                  icon
                  :aria-label="$t('common.delete')"
                  data-test="assign-service-options__deleteMember"
                  v-on="on"
                  @click="onRemoveUser(item.id)">
                  <v-icon>
                    mdi-close
                  </v-icon>
                </v-btn>
              </template>
              <span>{{ $t('eventSummary.deleteLinkTooltip') }}</span>
            </rc-tooltip>
          </td>
        </tr>
      </template>
    </v-data-table-a11y>
  </v-sheet>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { VDataTableA11y, RcTooltip } from '@libs/component-lib/components';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { DataTableHeader } from 'vuetify';
import { IListOption } from '@libs/shared-lib/types';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IAppointmentStaffMember } from '@libs/entities-lib/appointment';
import { IExtendedServiceOption } from './ServiceOptionsTable.vue';

export default Vue.extend({
  name: 'AssignServiceOptions',

  components: {
    VDataTableA11y,
    RcTooltip,
  },

  props: {
    staffMembers: {
      type: Array as () => IAppointmentStaffMember[],
      required: true,
    },

    users: {
      type: Array as () => IUserAccountMetadata[],
      required: true,
    },

    serviceOptions: {
      type: Array as () => IExtendedServiceOption[],
      required: true,
    },

    assignableTeamsIds: {
      type: Array as () => String[],
      default: () => [] as String[],
    },

    inTeamManagement: {
      type: Boolean,
      default: false,
    },

    appointmentProgramId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      loading: false,
      options: {
        page: 1,
      },
    };
  },

  computed: {
    serviceOptionTypes(): IOptionItem[] {
      return useAppointmentProgramStore().getServiceOptionTypes(this.serviceOptions.map((o) => o.serviceOptionType?.optionItemId));
    },

    customColumns(): Record<string, string> {
      const columns = { name: 'name', delete: 'delete' } as Record<string, string>;
      this.serviceOptions.forEach((so) => {
        columns[so.id] = `so_${so.id}`;
      });
      return columns;
    },

    headers(): Array<DataTableHeader> {
      const headers: DataTableHeader[] = [{
          text: this.$t('appointmentProgram.manageStaff.name') as string,
          value: 'displayName',
          width: 'auto',
          sortable: true,
        }];

        this.serviceOptions.forEach((so) => {
          headers.push({
            text: this.getTypeName(so.serviceOptionType),
            sortable: false,
            align: 'center',
            value: this.customColumns[so.id],
          });
        });

        if (!this.inTeamManagement) {
          headers.push({
            text: '',
            sortable: false,
            align: 'end',
            value: this.customColumns.delete,
          });
        }

        return headers;
    },
  },

  async created() {
    this.loading = true;
    await useAppointmentProgramStore().fetchServiceOptionTypes();
    this.loading = false;
  },

  methods: {
    getTypeName(serviceOptionType: IListOption): string {
      return this.$m(this.serviceOptionTypes.find((t) => t.id === serviceOptionType?.optionItemId)?.name);
    },

    getTeamNames(member: IUserAccountMetadata): string {
      const assignableTeams = member.teams?.filter((t) => this.assignableTeamsIds.includes(t.teamId));
      return assignableTeams?.map((t) => t.name).join(', ') || '-';
    },

    isMemberAssigned(soId: string, userId: string): boolean {
      return this.staffMembers.some((m) => m.userAccountId === userId && m.serviceOptionIds.includes(soId));
    },

    updateServiceOptionOnAssign(userId: string, soId: string, value: boolean) {
       // Don't mutate the props staffMembers
      const updatedStaffMembers = _cloneDeep(this.staffMembers);
      const member = updatedStaffMembers.find((m) => m.userAccountId === userId);
      if (value) {
        member.serviceOptionIds.push(soId);
      } else {
        member.serviceOptionIds = member.serviceOptionIds.filter((id) => id !== soId);
      }
      this.$emit('update:staffMembers', updatedStaffMembers);
    },

    async onCheckAssign({ memberId, soId, value }: { memberId: string, soId: string, value: boolean }) {
      // const updatedServiceOptions = this.updateServiceOptionOnAssign(memberId, soId, value);
      this.updateServiceOptionOnAssign(memberId, soId, value);
      if (this.inTeamManagement) {
        this.loading = true;
        // await updateStaffMembers(this.appointmentProgramId, updatedServiceOptions, this);
        this.loading = false;
      }
    },

    onRemoveUser(userId: string) {
      this.$emit('removeUser', userId);
    },

  },
});

</script>

<style scoped lang='scss'>

.checkbox-cell {
  text-align: center;
}

::v-deep .v-data-table__wrapper {
  td:first-child, th:first-child {
    position: sticky;
    left: 0;
    background-color: #fff;
    z-index: 10;
  }
  tr:not(:last-child) td {
   border-bottom: thin solid rgba(0, 0, 0, 0.12);
  }
}
 .in-program ::v-deep .v-data-table__wrapper {
    td:last-child, th:last-child {
    position: sticky;
    right: 0;
    background-color: white;
    z-index: 10;
  }
 }

::v-deep .v-data-table__wrapper > table > thead > tr > th:not(:first-child)  {
  padding-left: 12px;
  padding-right: 12px;
}

.no-wrap{
  white-space: nowrap;
}

</style>
