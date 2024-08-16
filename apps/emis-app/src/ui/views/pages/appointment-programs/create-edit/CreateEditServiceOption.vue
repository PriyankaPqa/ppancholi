<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="isEditMode ? $t('appointmentProgram.serviceOption.dialog.title.edit') : $t('appointmentProgram.serviceOption.dialog.title.add')"
      :show.sync="show"
      :loading="loading"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="isEditMode ? $t('common.buttons.save') : $t('common.buttons.add')"
      :submit-button-disabled="failed"
      :persistent="true"
      data-test="service-option-form-dialog"
      :tooltip-label="$t('common.tooltip_label')"
      fullscreen
      @cancel="$emit('update:show', false)"
      @close="$emit('update:show', false)"
      @submit="onSubmit">
      <v-row justify="center" class="pa-0">
        <v-col cols="12" xl="8" lg="9" md="11">
          <v-row justify="center">
            <v-col cols="12" xl="8" lg="9" md="11">
              <v-select-with-validation
                v-model="serviceOption.type.optionItemId"
                :label="$t('appointmentProgram.serviceOption.dialog.type') + ' *'"
                :items="serviceOptionTypes"
                :item-text="(item) => item ? $m(item.name) : null"
                :item-value="(item) => item ? item.id : null"
                :rules="{ required: true }"
                data-test="service-option-form-type" />
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col cols="12" xl="8" lg="9" md="11">
              <v-select-with-validation
                v-model="selectedModalitiesId"
                :label="`${$t('appointmentProgram.serviceOption.dialog.appointmentModalities')} *`"
                :items="appointmentModalities"
                multiple
                :rules="{ required: true }"
                :item-value="(item) => item.id"
                :item-text="(item) => $m(item.name)"
                data-test="service-option-form-modalities">
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
import { VForm } from '@libs/shared-lib/types';
import { useAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program';
import { IServiceOption } from '@libs/entities-lib/appointment';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import helpers from '@libs/entities-lib/helpers';

export default Vue.extend({
  name: 'CreateEditServiceOption',

  components: {
    RcDialog,
    VSelectWithValidation,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    appointmentProgramId: {
      type: String,
      default: '',
    },

    serviceOption: {
      type: Object as () => IServiceOption,
      required: true,
    },

    existingTypesIds: {
      type: Array as () => String[],
      required: true,
    },

    isEditMode: {
      type: Boolean,
      required: true,
    },

  },

  data() {
    return {
      loading: false,
      selectedModalitiesId: this.serviceOption.appointmentModalities.map((m) => m.optionItemId),
    };
  },

  computed: {
    serviceOptionTypes(): IOptionItem[] {
      const allTypes = useAppointmentProgramStore().getServiceOptionTypes(this.serviceOption.type.optionItemId);
      return allTypes.filter((t) => !this.existingTypesIds.includes(t.id));
    },

    appointmentModalities(): IOptionItem[] {
      return useAppointmentProgramStore().getAppointmentModalities(this.serviceOption?.appointmentModalities?.map((m) => m.optionItemId));
    },

  },

  methods: {
    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.serviceOption.appointmentModalities = this.selectedModalitiesId.map((id) => ({ optionItemId: id, specifiedOther: '' }));

        if (this.appointmentProgramId) {
          this.loading = true;
          const res = !this.isEditMode ? await useAppointmentProgramStore().createServiceOption(this.appointmentProgramId, this.serviceOption)
          : await useAppointmentProgramStore().updateServiceOption(this.appointmentProgramId, this.serviceOption);

          if (res) {
            this.$toasted.global.success(this.isEditMode ? this.$t('appointmentProgram.serviceOption.dialog.update.success')
            : this.$t('appointmentProgram.serviceOption.dialog.create.success'));
            this.$emit('update:show', false);
          } else {
            this.$toasted.global.error(this.$t('appointmentProgram.edit.changeStatus.error'));
          }
          this.loading = false;
        } else {
          this.$emit('submit', this.serviceOption);
        }
      } else {
        helpers.scrollToFirstError('dialogScrollAnchor');
      }
    },

  },
});
</script>

<style>

</style>
