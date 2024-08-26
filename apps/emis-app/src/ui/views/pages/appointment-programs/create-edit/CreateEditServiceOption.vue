<template>
  <validation-observer ref="form" v-slot="{ failed, changed }" slim>
    <rc-dialog
      :title="isEditMode ? $t('appointmentProgram.serviceOption.dialog.title.edit') : $t('appointmentProgram.serviceOption.dialog.title.add')"
      :show.sync="show"
      :loading="loading"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="isEditMode ? $t('common.buttons.save') : $t('common.buttons.add')"
      :submit-button-disabled="failed || (isEditMode && !changed && !modalityDeleted)"
      :persistent="true"
      data-test="service-option-form-dialog"
      :tooltip-label="$t('common.tooltip_label')"
      fullscreen
      @cancel="$emit('close')"
      @close="$emit('close')"
      @submit="onSubmit">
      <v-row justify="center" class="pa-0">
        <v-col cols="12" xl="8" lg="9" md="11">
          <v-row justify="center" class=" ma-0 pa-0 pb-4">
            <v-col cols="12" xl="8" lg="9" md="11" class="pa-0 pa-0">
              <validation-provider
                name="status"
                tag="div">
                <status-select
                  v-model="localServiceOption.serviceOptionStatus"
                  data-test="service-option-status"
                  :statuses="[Status.Active, Status.Inactive]"
                  status-name="Status" />
              </validation-provider>
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col cols="12" xl="8" lg="9" md="11">
              <v-select-with-validation
                v-model="localServiceOption.serviceOptionType.optionItemId"
                :label="$t('appointmentProgram.serviceOption.dialog.type') + ' *'"
                :items="serviceOptionTypes"
                :item-text="(item) => item ? $m(item.name) : null"
                :item-value="(item) => item ? item.id : null"
                :rules="{ required: true }"
                data-test="service-option-form-serviceOptionType" />
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col cols="12" xl="8" lg="9" md="11">
              <v-select-with-validation
                v-model="selectedModalitiesIds"
                :label="`${$t('appointmentProgram.serviceOption.dialog.appointmentModalities')} *`"
                :items="appointmentModalities"
                multiple
                clearable
                :rules="{ required: true }"
                :item-value="(item) => item.id"
                :item-text="(item) => $m(item.name)"
                data-test="service-option-form-modalities"
                @delete="modalityDeleted = true">
                <template #item=" { item, attrs }">
                  <div class="v-list-item__action">
                    <div class="v-simple-checkbox">
                      <div class="v-input--selection-controls__ripple primary--text" />
                      <i
                        aria-hidden="true"
                        :class="{
                          'v-icon notranslate mdi theme--light': true,
                          'mdi-checkbox-marked': attrs['aria-selected'] === 'true',
                          'mdi-checkbox-blank-outline': attrs['aria-selected'] !== 'true',
                        }" />
                    </div>
                  </div>

                  <div class="full-width" :data-test="`service-option-form-modalities__item--${item.name.translation.en}`">
                    <div class="d-flex justify-space-between">
                      <span> {{ $m(item.name) }}</span><span> {{ item.isOnline ? $t('appointmentProgram.serviceOption.dialog.isOnline') : '' }}</span>
                    </div>
                  </div>
                </template>
              </v-select-with-validation>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </rc-dialog>
  </validation-observer>
</template>

<script lang='ts'>
import Vue from 'vue';
import {
  RcDialog,
  VSelectWithValidation,
} from '@libs/component-lib/components';
import _cloneDeep from 'lodash/cloneDeep';
import { Status, VForm } from '@libs/shared-lib/types';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { IServiceOption } from '@libs/entities-lib/appointment';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import helpers from '@libs/entities-lib/helpers';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';
import { IExtendedServiceOption } from '../components/ServiceOptionsTable.vue';

export default Vue.extend({
  name: 'CreateEditServiceOption',

  components: {
    RcDialog,
    VSelectWithValidation,
    StatusSelect,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    // If the appointment program is already created, it has an id
    appointmentProgramId: {
      type: String,
      default: '',
    },

    serviceOption: {
      type: Object as () => IExtendedServiceOption,
      default: null,
    },

    existingTypesIds: {
      type: Array as () => String[],
      required: true,
    },

    // Whether this service option is being created or updated
    isEditMode: {
      type: Boolean,
      required: true,
    },

    tempId: {
      type: Number,
      default: 0,
    },

  },

  data() {
    const emptyServiceOption : Partial<IExtendedServiceOption> = {
      serviceOptionType: { optionItemId: '', specifiedOther: null },
      appointmentModalities: [],
      serviceOptionStatus: Status.Active,
    };

    if (!this.appointmentProgramId) {
      emptyServiceOption.tempId = this.tempId;
    }

    return {
      Status,
      loading: false,
      modalityDeleted: false,
      selectedModalitiesIds: this.serviceOption?.appointmentModalities.map((m) => m.optionItemId) || [],
      localServiceOption: _cloneDeep(this.serviceOption) || emptyServiceOption as IServiceOption | Partial<IServiceOption>,
    };
  },

  computed: {
    serviceOptionTypes(): IOptionItem[] {
      const allTypes = useAppointmentProgramStore().getServiceOptionTypes(this.localServiceOption.serviceOptionType.optionItemId);
      return allTypes.filter((t) => !this.existingTypesIds.includes(t.id));
    },

    appointmentModalities(): IOptionItem[] {
      return useAppointmentProgramStore().getAppointmentModalities(this.localServiceOption?.appointmentModalities?.map((m) => m.optionItemId));
    },

  },

  methods: {
    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.localServiceOption.appointmentModalities = this.selectedModalitiesIds.map((id) => ({ optionItemId: id, specifiedOther: null }));

        // If there is an appointmentProgramId, it means the appointment program is already created, so creating and updating service options
        // is done by calling directly the respective endpoints
        if (this.appointmentProgramId) {
          this.loading = true;
          const res = !this.isEditMode ? await useAppointmentProgramStore().createServiceOption(this.appointmentProgramId, this.localServiceOption as IServiceOption)
          : await useAppointmentProgramStore().updateServiceOption(this.appointmentProgramId, this.localServiceOption as IServiceOption);

          if (res) {
            this.$toasted.global.success(!this.isEditMode ? this.$t('appointmentProgram.serviceOption.dialog.create.success')
            : this.$t('appointmentProgram.serviceOption.dialog.update.success'));
            this.$emit('update:show', false);
          } else {
            !this.isEditMode ? this.$toasted.global.error(this.$t('appointmentProgram.serviceOption.dialog.create.error'))
            : this.$toasted.global.error(this.$t('appointmentProgram.serviceOption.dialog.update.error'));
          }
          this.loading = false;
          this.$emit('close');

        // When the appointment program is being created now, the service option data is being added to the creation payload
        } else {
          this.$emit('submit', this.localServiceOption);
        }
      } else {
        helpers.scrollToFirstError('dialogScrollAnchor');
      }
    },

  },
});
</script>
