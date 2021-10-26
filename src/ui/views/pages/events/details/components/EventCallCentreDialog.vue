<template>
  <validation-observer ref="form" v-slot="{ failed, pristine }" slim>
    <rc-dialog
      :title="title"
      :show="true"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="isEditMode? $t('common.save'): $t('common.add')"
      :content-only-scrolling="true"
      :persistent="true"
      :max-width="750"
      :min-height="530"
      :loading="loading"
      :submit-button-disabled="failed || (isEditMode && pristine)"
      @cancel="$emit('close')"
      @close="$emit('close')"
      @submit="onSubmit">
      <v-container>
        <v-row v-if="callCentre" justify="center">
          <v-col cols="12" class="pa-0">
            <language-tabs :language="languageMode" @click="setLanguageMode" />

            <v-row class="pt-4">
              <v-col cols="8" md="8" sm="12" class="pr-md-6 pr-xl-6 pr-lg-6 pb-0">
                <v-text-field-with-validation
                  v-model="callCentre.name.translation[languageMode]"
                  data-test="callCentre-name"
                  :label="`${$t('eventSummary.callCentre.name')}*`"
                  :rules="rules.name"
                  @input="resetAsUnique()" />
              </v-col>

              <v-col cols="4" md="4" sm="12">
                <div :class="['status', isActive ? 'status_success': 'grey' ]">
                  <div class="pl-4 white--text" sm="12" md="9">
                    {{ $t('eventSummary.status') }}
                    <span class="rc-body14 fw-bold white--text text-uppercase" data-test="callCentre-status">
                      {{ statusName }}
                    </span>
                  </div>

                  <validation-provider>
                    <v-switch
                      v-model="isActive"
                      data-test="callcentre-switch-status"
                      class="pt-0 mt-0"
                      height="48"
                      hide-details
                      color="white"
                      flat
                      @change="updateStatus($event)" />
                  </validation-provider>
                </div>
              </v-col>
            </v-row>

            <v-row class="mt-0">
              <v-col cols="6" sm="12" md="6" class="pb-0">
                <v-date-field-with-validation
                  v-model="callCentre.startDate"
                  :close-on-content-click="false"
                  data-test="callcentre-start-date"
                  :rules="rules.startDate"
                  prepend-inner-icon="mdi-calendar"
                  :label="$t('eventSummary.callCentre.startDate')"
                  :placeholder="$t('eventSummary.callCentre.startDate')" />
              </v-col>

              <v-col cols="6" sm="12" md="6" class="pb-0">
                <v-date-field-with-validation
                  v-model="callCentre.endDate"
                  :close-on-content-click="false"
                  :data-test="'callcentre-end-date'"
                  :rules="rules.endDate"
                  prepend-inner-icon="mdi-calendar"
                  :label="$t('eventSummary.callCentre.endDate')"
                  :placeholder="$t('eventSummary.callCentre.endDate')"
                  :min="callCentre.startDate"
                  :picker-date="callCentre.startDate" />
              </v-col>
            </v-row>

            <v-row class="mt-0">
              <v-col cols="12" class="pb-0">
                <v-text-area-with-validation
                  v-model="callCentre.details.translation[languageMode]"
                  data-test="callcentre-details"
                  full-width
                  rows="3"
                  :label="$t('eventSummary.callCentre.details')"
                  :rules="rules.details" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </rc-dialog>
  </validation-observer>
</template>

<script lang='ts'>
import mixins from 'vue-typed-mixins';
import _cloneDeep from 'lodash/cloneDeep';
import { TranslateResult } from 'vue-i18n';
import {
  RcDialog,
  VTextFieldWithValidation,
  VDateFieldWithValidation,
  VTextAreaWithValidation,
} from '@crctech/component-library';
import helpers from '@/ui/helpers/helpers';

import { EEventSummarySections, VForm } from '@/types';
import {
  EEventCallCentreStatus,
  IEventCallCentre,
  IEventEntity,
} from '@/entities/event';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import entityUtils from '@/entities/utils';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@/constants/validations';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';

export default mixins(handleUniqueNameSubmitError).extend({
  name: 'EventCallCentreDialog',

  components: {
    RcDialog,
    LanguageTabs,
    VTextFieldWithValidation,
    VDateFieldWithValidation,
    VTextAreaWithValidation,
  },

  props: {
    event: {
      type: Object as () => IEventEntity,
      required: true,
    },
    id: {
      type: String,
      default: '',
    },
    isEditMode: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      languageMode: 'en',
      emptyCallCentre: {
        name: null,
        startDate: null,
        endDate: null,
        status: EEventCallCentreStatus.Inactive,
        details: null,
      },
      callCentre: null as IEventCallCentre,
      isActive: false,
      getLocalStringDate: helpers.getLocalStringDate,
      loading: false,
    };
  },

  computed: {
    endDateRule(): Record<string, unknown> {
      if (this.callCentre.startDate && this.callCentre.endDate) {
        return {
          mustBeAfterOrSame: { X: this.callCentre.endDate, Y: this.callCentre.startDate },
        };
      }
      return {};
    },

    rules():Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
          customValidator: { isValid: this.isNameUnique, messageKey: 'validations.alreadyExists' },
        },
        endDate: {
          ...this.endDateRule,
        },
        details: {
          max: MAX_LENGTH_LG,
        },
      };
    },

    statusName(): TranslateResult {
      const status = this.isActive ? 'Active' : 'Inactive';
      return this.$t(`eventSummary.status.${status}`);
    },

    title(): TranslateResult {
      if (this.isEditMode) {
        return this.$t('eventSummary.editCallCentre');
      }
      return this.$t('eventSummary.addCallCentre');
    },
  },

  created() {
    if (this.isEditMode) {
      this.initEditMode();
    } else {
      this.initCreateMode();
    }
  },

  methods: {
    initCreateMode() {
      const emptyCentre = this.emptyCallCentre;
      emptyCentre.name = entityUtils.initMultilingualAttributes();
      emptyCentre.details = entityUtils.initMultilingualAttributes();
      this.callCentre = emptyCentre;
    },

    initEditMode() {
      const callCentre = this.event.callCentres.find((centre:IEventCallCentre) => centre.id === this.id);
      if (callCentre) {
        this.callCentre = _cloneDeep(callCentre);
        this.callCentre.startDate = callCentre.startDate ? this.getLocalStringDate(callCentre.startDate, 'EventCallCentre.startDate') : null;
        this.callCentre.endDate = callCentre.endDate ? this.getLocalStringDate(callCentre.endDate, 'EventCallCentre.endDate') : null;
        this.isActive = callCentre.status === EEventCallCentreStatus.Active;
      }
    },

    fillEmptyMultilingualFields() {
      this.callCentre.name = entityUtils.getFilledMultilingualField(this.callCentre.name);
      this.callCentre.details = entityUtils.getFilledMultilingualField(this.callCentre.details);
    },

    makePayload(callCentre: IEventCallCentre): IEventCallCentre {
      return {
        ...callCentre,
        startDate: callCentre.startDate ? new Date(callCentre.startDate).toISOString() : null,
        endDate: callCentre.endDate ? new Date(callCentre.endDate).toISOString() : null,
      };
    },

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.fillEmptyMultilingualFields();
        this.loading = true;
        try {
          await this.submitCallCentre();
          this.$emit('close');
        } catch (e) {
          this.handleSubmitError(e);
        } finally {
          this.loading = false;
        }
      }
    },

    async submitCallCentre() {
      const callCentrePayload = this.makePayload(this.callCentre);
      await this.$storage.event.actions.updateEventSection(
        {
          eventId: this.event.id,
          payload: callCentrePayload,
          section: EEventSummarySections.CallCentre,
          action: this.isEditMode ? 'edit' : 'add',
        },
      );
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.fillEmptyMultilingualFields();
    },

    updateStatus(value: boolean) {
      this.callCentre.status = value ? EEventCallCentreStatus.Active : EEventCallCentreStatus.Inactive;
    },
  },
});

</script>

<style scoped>
.status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-right: 4px;
  height: 56px;
  border-radius: 4px;
}

</style>
