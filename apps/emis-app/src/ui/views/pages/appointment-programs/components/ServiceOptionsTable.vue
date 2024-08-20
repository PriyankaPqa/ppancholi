<template>
  <div>
    <div class="fw-bold pb-4">
      {{ $t('appointmentProgram.section.serviceOptions') }}
    </div>
    <div class="table_top_header border-radius-top no-bottom-border">
      <v-btn color="primary" data-test="add-service-option" @click="onAdd">
        {{ $t('appointmentProgram.serviceOption.table.addServiceOption') }}
      </v-btn>
    </div>
    <v-data-table-a11y
      :class="{ 'table border-radius-bottom': true, loading }"
      data-test="serviceOptions__table"
      hide-default-footer
      :loading="loading"
      :headers="headers"
      :items="serviceOptions"
      :item-key="'serviceOptionType'"
      must-sort
      @update:sort-by="sortBy = $event"
      @update:sort-desc="sortDesc = $event">
      <template #[`item.${customColumns.serviceOptionType}`]="{ item }">
        <router-link
          data-test="serviceOption__type"
          class="rc-link14 font-weight-bold"
          :to="getDetailsRoute(item.id)">
          {{ getTypeName(item.serviceOptionType) }}
        </router-link>
      </template>

      <template #[`item.${customColumns.modality}`]="{ item }">
        <span data-test="serviceOption__modality"> {{ getModalitiesNames(item.appointmentModalities) }} </span>
      </template>

      <template #[`item.${customColumns.status}`]="{ item }">
        <status-chip data-test="serviceOption__status" status-name="Status" :status="item.serviceOptionStatus" />
      </template>

      <template #[`item.${customColumns.edit}`]="{ item }">
        <v-btn icon data-test="editDocument-link" :aria-label="$t('common.edit')" @click="selectServiceOption(item)">
          <v-icon size="24" color="grey darken-2">
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>

      <template #[`item.${customColumns.delete}`]>
        <v-btn icon data-test="editDocument-link" :aria-label="$t('common.delete')">
          <v-icon size="24" color="grey darken-2">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </v-data-table-a11y>

    <create-edit-service-option
      v-if="showServiceOptionDialog"
      :show.sync="showServiceOptionDialog"
      :is-edit-mode="!!selectedServiceOption"
      :appointment-program-id="appointmentProgramId"
      :existing-types-ids="existingTypesIds"
      :service-option="selectedServiceOption"
      :temp-id="serviceOptionTempId"
      @submit="onUpdateServiceOption"
      @close="onCloseDialog" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import { VDataTableA11y } from '@libs/component-lib/components';
import { IServiceOption } from '@libs/entities-lib/appointment';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IListOption } from '@libs/shared-lib/types';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import CreateEditServiceOption from '../create-edit/CreateEditServiceOption.vue';

export interface IExtendedServiceOption extends IServiceOption {
  tempId?: Number;
}

export default Vue.extend({
  name: 'ServiceOptionsTable',

  components: {
    VDataTableA11y,
    CreateEditServiceOption,
    StatusChip,
  },

  props: {
    appointmentProgramId: {
      type: String,
      default: '',
    },

    serviceOptions: {
      type: Array as () => IExtendedServiceOption[],
      required: true,
    },
  },

  data() {
    return {
      sortDesc: false,
      sortBy: 'metadata.displayName',
      loading: false,
      selectedServiceOption: null,
      showServiceOptionDialog: false,
      serviceOptionTempId: 0,
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        serviceOptionType: 'serviceOptionType',
        modality: 'Metadata/Modality',
        status: 'status',
        edit: 'edit',
        delete: 'delete',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('appointmentProgram.serviceOption.table.type') as string,
          filterable: false,
          value: this.customColumns.serviceOptionType,
          sort: (a, b) => this.getTypeName(a).localeCompare(this.getTypeName(b)),
        },
        {
          text: this.$t('appointmentProgram.serviceOption.table.modality') as string,
          filterable: false,
          sortable: false,
          value: this.customColumns.modality,
        },
        {
          text: this.$t('appointmentProgram.serviceOption.table.status') as string,
          filterable: false,
          sortable: false,
          value: this.customColumns.status,
        }, {
          text: this.$t('common.edit') as string,
          class: 'rc-transparent-text',
          sortable: false,
          value: this.customColumns.edit,
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

    existingTypesIds(): string[] {
      return this.serviceOptions.map((o) => o.serviceOptionType?.optionItemId).filter((id) => id !== this.selectedServiceOption?.serviceOptionType?.optionItemId);
    },

    serviceOptionTypes(): IOptionItem[] {
      return useAppointmentProgramStore().getServiceOptionTypes(this.serviceOptions.map((o) => o.serviceOptionType?.optionItemId));
    },

    appointmentModalities(): IOptionItem[] {
      return useAppointmentProgramStore().getAppointmentModalities(this.serviceOptions.map((o) => o.appointmentModalities?.map((m) => m.optionItemId)).flat());
    },

  },

  async created() {
    this.loading = true;
    await Promise.all([useAppointmentProgramStore().fetchServiceOptionTypes(),
      useAppointmentProgramStore().fetchAppointmentModalities()]);
    this.loading = false;
  },

  methods: {
    getDetailsRoute(id: string) {
      return {
        name: '',
        params: {
           id,
        },
      };
    },

    getTypeName(serviceOptionType: IListOption): string {
      return this.$m(this.serviceOptionTypes.find((t) => t.id === serviceOptionType?.optionItemId)?.name);
    },

    getModalitiesNames(modalities: IListOption[]) {
      return modalities.map((m) => this.$m(this.appointmentModalities.find((t) => t.id === m.optionItemId)?.name)).join(', ');
    },

    selectServiceOption(serviceOption:IExtendedServiceOption) {
      this.selectedServiceOption = serviceOption;
      this.showServiceOptionDialog = true;
    },

    onCloseDialog() {
      this.showServiceOptionDialog = false;
      this.selectedServiceOption = null;
    },

    onAdd() {
      this.serviceOptionTempId += 1;
      this.showServiceOptionDialog = true;
    },

    // When the program is being created, the service options need to be added to the creation payload
    onUpdateServiceOption(serviceOption: IExtendedServiceOption) {
        const index = this.serviceOptions.findIndex((o) => o.tempId === serviceOption.tempId);

        if (index > -1) {
          this.serviceOptions.splice(index, 1, serviceOption);
        } else {
          this.serviceOptions.push(serviceOption);
        }

      this.onCloseDialog();
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
