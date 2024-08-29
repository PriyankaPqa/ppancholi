<template>
  <v-sheet rounded outlined class="ma-0" height="100%">
    <v-data-table-a11y
      data-test="assign-service-options__table"
      :headers="headers"
      :loading="loading"
      dense
      :options.sync="options"
      :items="staffMembers"
      must-sort>
      <template #body="props">
        <tr v-for="item in props.items" :key="item.id">
          <td>
            <div class="d-flex flex-column px-4 py-1">
              <span class="rc-body14 fw-bold">  {{ item.displayName }} </span>
              <span v-if="!inTeamManagement" class="rc-body12">  {{ 'team names' }} </span>
            </div>
          </td>
          <td v-for="so in localServiceOptions" :key="so.id" class="checkbox-cell">
            <v-simple-checkbox
              :data-test="`assign_service_option_${so.id}_${item.id}`"
              :ripple="false"
              :value=" isMemberAssigned(so.id, item.id)"
              @input="onCheckAssign({ memberId: item.id, soId: so.id, value: $event })" />
          </td>
        </tr>
      </template>
    </v-data-table-a11y>
  </v-sheet>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { VDataTableA11y } from '@libs/component-lib/components';
import { IServiceOption } from '@libs/entities-lib/appointment';
import { IUserAccountMetadata } from '@libs/entities-lib/user-account';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { DataTableHeader } from 'vuetify';
import { IListOption } from '@libs/shared-lib/types';
import { IOptionItem } from '@libs/entities-lib/optionItem';

export default Vue.extend({
  name: 'ServiceOptionsTable',

  components: {
    VDataTableA11y,
  },

  props: {
    staffMembers: {
      type: Array as () => IUserAccountMetadata[],
      required: true,
    },

    serviceOptions: {
      type: Array as () => IServiceOption[],
      required: true,
    },

    inTeamManagement: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      loading: false,
      options: {
        page: 1,
      },
      localServiceOptions: [] as IServiceOption[],
    };
  },

  computed: {
    serviceOptionTypes(): IOptionItem[] {
      return useAppointmentProgramStore().getServiceOptionTypes(this.serviceOptions.map((o) => o.serviceOptionType?.optionItemId));
    },

    customColumns(): Record<string, string> {
      const columns = { name: 'name' } as Record<string, string>;
      this.serviceOptions.forEach((so) => {
        columns[so.id] = `so_${so.id}`;
      });
      return columns;
    },

    headers(): Array<DataTableHeader> {
      const headers: DataTableHeader[] = [{
          text: this.$t('appointmentProgram.manageStaff.name') as string,
          value: 'displayName',
          width: '70%',
          sortable: true,
        }];

        this.serviceOptions.forEach((so) => {
          headers.push({
            text: this.getTypeName(so.serviceOptionType),
            sortable: false,
            align: 'center',
            value: this.customColumns[so.id],
            width: '10%',
          });
        });

        return headers;
    },
  },

  async created() {
    this.loading = true;
    this.localServiceOptions = _cloneDeep(this.serviceOptions);
    await useAppointmentProgramStore().fetchServiceOptionTypes();
    this.loading = false;
  },

  methods: {
    getTypeName(serviceOptionType: IListOption): string {
      return this.$m(this.serviceOptionTypes.find((t) => t.id === serviceOptionType?.optionItemId)?.name);
    },

    isMemberAssigned(soId: string, memberId: string): boolean {
      return this.localServiceOptions.find((so) => so.id === soId).staffMembers.includes(memberId);
    },

    onCheckAssign({ memberId, soId, value }: { memberId: string, soId: string, value: boolean }) {
      const updatedServiceOption = this.localServiceOptions.find((so) => so.id === soId);
      if (value) {
        updatedServiceOption.staffMembers.push(memberId);
      } else {
        updatedServiceOption.staffMembers = updatedServiceOption.staffMembers.filter((m) => m !== memberId);
      }
    },
  },
});

</script>

<style scoped lang='scss'>

.checkbox-cell {
  text-align: center;
}

::v-deep .v-data-table__wrapper tr:not(:last-child) td {
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}

::v-deep .v-data-table__wrapper > table > thead > tr > th:not(:first-child)  {
  padding-left: 4px;
  padding-right: 4px;
}

</style>
