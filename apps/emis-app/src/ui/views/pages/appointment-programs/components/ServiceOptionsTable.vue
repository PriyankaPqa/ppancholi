<template>
  <div>
    <div class="fw-bold pb-4">
      {{ $t('appointmentProgram.section.serviceOptions') }}
    </div>
    <div class="table_top_header border-radius-top no-bottom-border">
      <v-btn color="primary" data-test="add-service-option" @click="showServiceOptionDialog = true">
        {{ $t('appointmentProgram.serviceOption.table.addServiceOption') }}
      </v-btn>
    </div>
    <v-data-table-a11y
      :class="{ 'table border-radius-bottom': true, loading }"
      data-test="serviceOptions__table"
      must-sort
      hide-default-footer
      :loading="loading"
      :headers="headers"
      :items="serviceOptions"
      @update:sort-by="sortBy = $event"
      @update:sort-desc="sortDesc = $event">
      <template #[`item.${customColumns.name}`]="{ item }">
        <button
          type="button"
          data-test="serviceOption__name"
          class="rc-link14 font-weight-bold"
          @click="selectServiceOption(item)">
          {{ getTypeName(item.type) }}
        </button>
      </template>

      <template #[`item.${customColumns.modality}`]="{ item }">
        <span data-test="serviceOption__modality"> {{ getModalitiesNames(item.appointmentModalities) }} </span>
      </template>

      <template #[`item.${customColumns.status}`]="{ item }">
        <status-chip data-test="serviceOption__status" status-name="Status" :status="item.status" />
      </template>
    </v-data-table-a11y>

    <create-edit-service-option
      v-if="showServiceOptionDialog"
      :show.sync="showServiceOptionDialog"
      :is-edit-mode="!!selectedServiceOption"
      :appointment-program-id="appointmentProgramId"
      :existing-types-ids="existingTypesIds"
      :service-option="selectedServiceOption || new ServiceOption()"
      @submit="onUpdateServiceOption" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import { VDataTableA11y } from '@libs/component-lib/components';
import { IServiceOption, ServiceOption } from '@libs/entities-lib/appointment';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IListOption } from '@libs/shared-lib/types';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import CreateEditServiceOption from '../create-edit/CreateEditServiceOption.vue';

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
      type: Array as () => IServiceOption[],
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
      ServiceOption,
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        name: 'name',
        modality: 'Metadata/Modality',
        status: 'status',
      };
    },

    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('appointmentProgram.serviceOption.table.name') as string,
          filterable: false,
          sortable: true,
          value: this.customColumns.name,
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
          sortable: true,
          value: this.customColumns.status,
        },
      ];
    },

    existingTypesIds(): string[] {
      return this.serviceOptions.map((o) => o.type.optionItemId).filter((id) => id !== this.selectedServiceOption?.type?.optionItemId);
    },

    serviceOptionTypes(): IOptionItem[] {
      return useAppointmentProgramStore().getServiceOptionTypes(this.serviceOptions.map((o) => o.type.optionItemId));
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
    getTypeName(type: IListOption): string {
      return this.$m(this.serviceOptionTypes.find((t) => t.id === type.optionItemId)?.name);
    },

    getModalitiesNames(modalities: IListOption[]) {
      return modalities.map((m) => this.$m(this.appointmentModalities.find((t) => t.id === m.optionItemId)?.name)).join(', ');
    },

    selectServiceOption(serviceOption:ServiceOption) {
      this.selectedServiceOption = serviceOption;
      this.showServiceOptionDialog = true;
    },

    onUpdateServiceOption(serviceOption: ServiceOption) {
        const index = this.serviceOptions.findIndex((o) => o.type.optionItemId === serviceOption.type.optionItemId);

        if (index > -1) {
          this.serviceOptions.splice(index, 1, serviceOption);
        } else {
          this.serviceOptions.push(serviceOption);
        }

      this.showServiceOptionDialog = false;
      this.selectedServiceOption = null;
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
