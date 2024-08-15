<template>
  <div>
    <div class="fw-bold pb-4">
      {{ $t('appointmentProgram.section.serviceOptions') }}
    </div>
    <div class="table_top_header border-radius-top no-bottom-border">
      <v-btn color="primary" data-test="add-service-option" @click="showAddServiceOptionDialog = true">
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
        <span data-test="serviceOption__name">{{ item.name }}</span>
      </template>

      <template #[`item.${customColumns.duration}`]="{ item }">
        <span data-test="serviceOption__duration"> {{ item.duration }} </span>
      </template>

      <template #[`item.${customColumns.modality}`]="{ item }">
        <span data-test="serviceOption__modality"> {{ item.modality }} </span>
      </template>

      <template #[`item.${customColumns.status}`]="{ item }">
        <span data-test="serviceOption__status"> {{ item.status }} </span>
      </template>
    </v-data-table-a11y>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import { VDataTableA11y } from '@libs/component-lib/components';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { IAppointmentProgram, IServiceOption } from '@libs/entities-lib/appointment';

export default Vue.extend({
  name: 'ServiceOptionsTable',

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
      showAddServiceOptionDialog: false,
      loading: false,
      serviceOptions: [] as IServiceOption[],
    };
  },

  computed: {
    customColumns(): Record<string, string> {
      return {
        name: 'name',
        duration: 'duration',
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
          text: this.$t('appointmentProgram.serviceOption.table.duration') as string,
          filterable: false,
          sortable: false,
          value: this.customColumns.duration,
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
