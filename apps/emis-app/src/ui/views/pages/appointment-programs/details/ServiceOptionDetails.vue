<template>
  <rc-page-content :title="$t('appointmentProgram.serviceOption.details.title')">
    <rc-page-loading v-if="loading" />
    <v-row v-else-if="serviceOption" class="justify-center mt-6">
      <v-col cols="12" lg="8">
        <div class="pb-4 d-flex justify-space-between">
          <div class="details-page-title" data-test="serviceOption_details_type">
            {{ $m(serviceOptionTypeName) }}
          </div>
          <div class="d-flex flex-nowrap align-start">
            <status-chip class="mt-1 mr-2" data-test="serviceOption_details_status" status-name="Status" :status="serviceOption.serviceOptionStatus" />
            <v-btn icon :aria-label="$t('common.edit')" data-test="edit-link" @click="showServiceOptionDialog = true">
              <v-icon>
                mdi-pencil
              </v-icon>
            </v-btn>
            <v-btn icon data-test="delete-link" :aria-label="$t('common.delete')" @click="deleteServiceOption">
              <v-icon>
                mdi-delete
              </v-icon>
            </v-btn>
          </div>
        </div>
        <div class="rc-body14 fw-bold py-2">
          {{ $t('appointmentProgram.serviceOption.details.modalities') }}
        </div>
        <v-sheet rounded outlined>
          <v-simple-table data-test="serviceOption_modalities_table">
            <thead>
              <tr>
                <th scope="col">
                  {{ $t('appointmentProgram.serviceOption.details.name') }}
                </th>
                <th scope="col" class="transparent-text">
                  {{ $t('a11y.empty_table_header_cell') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="modality in appointmentModalities" :key="modality.id">
                <td :data-test="`serviceOption_modalities_name_${modality.id}`">
                  {{ $m(modality.name) }}
                </td>
                <td :data-test="`serviceOption_modalities_isOnline_${modality.id}`" class="d-flex justify-end align-center">
                  {{ modality.isOnline ? $t('appointmentProgram.serviceOption.details.isOnline') : '' }}
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-sheet>
      </v-col>
    </v-row>
    <template slot="actions">
      <v-btn
        color="primary"
        data-test="service_option_details_back_btn"
        @click="navigateBack">
        {{ $t('appointmentProgram.serviceOption.details.backToPrograms') }}
      </v-btn>
    </template>
    <create-edit-service-option
      v-if="showServiceOptionDialog"
      :show.sync="showServiceOptionDialog"
      is-edit-mode
      :appointment-program-id="appointmentProgramId"
      :existing-types-ids="existingTypesIds"
      :service-option="serviceOption"
      @close="showServiceOptionDialog = false" />
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent, RcPageLoading } from '@libs/component-lib/components';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { IAppointmentProgram, IServiceOption } from '@libs/entities-lib/appointment';
import { IMultilingual } from '@libs/shared-lib/types';
import helpers from '../appointmentProgramsHelpers';

export default Vue.extend({
  name: 'ServiceOptionDetails',

  components: {
    RcPageContent,
    StatusChip,
    RcPageLoading,
  },

  props: {
    serviceOptionId: {
      type: String,
      required: true,
    },
    appointmentProgramId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      showServiceOptionDialog: false,
      loading: false,
    };
  },

 computed: {
    serviceOptionTypeName(): IMultilingual {
      const allTypes = useAppointmentProgramStore().getServiceOptionTypes(this.serviceOption.serviceOptionType.optionItemId);
      return allTypes?.find((t) => this.serviceOption.serviceOptionType.optionItemId === t.id)?.name;
    },

    appointmentModalities(): IOptionItem[] {
      const currentModalitiesIds = this.serviceOption.appointmentModalities.map((m) => m.optionItemId);
      const allModalities = useAppointmentProgramStore().getAppointmentModalities(this.serviceOption?.appointmentModalities?.map((m) => m.optionItemId));
      return allModalities.filter((mod) => currentModalitiesIds.includes(mod.id));
    },

    appointmentProgram(): IAppointmentProgram {
      return useAppointmentProgramStore().getById(this.appointmentProgramId);
    },

    serviceOption(): IServiceOption {
      return this.appointmentProgram.serviceOptions.find((so) => so.id === this.serviceOptionId);
    },

    existingTypesIds(): string[] {
      return this.appointmentProgram.serviceOptions.map((o) => o.serviceOptionType?.optionItemId).filter((id) => id !== this.serviceOption.serviceOptionType?.optionItemId);
    },

 },

 async created() {
    this.loading = true;
    await Promise.all([useAppointmentProgramStore().fetchServiceOptionTypes(),
      useAppointmentProgramStore().fetchAppointmentModalities(),
     ]);
    await useAppointmentProgramStore().fetch(this.appointmentProgramId);
    this.loading = false;
  },

  methods: {
    navigateBack() {
      this.$router.back();
    },

   async deleteServiceOption() {
      const res = await helpers.deleteServiceOption(this.serviceOption.id, this.appointmentProgram, this);
      if (res) {
        this.$router.back();
      }
    },
  },
});
</script>

<style scoped lang="scss">
  .transparent-text {
    color: transparent !important;
   font-size: 1px;
  }
</style>
