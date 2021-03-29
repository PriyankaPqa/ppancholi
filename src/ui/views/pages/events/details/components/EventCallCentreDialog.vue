<template>
  <rc-dialog
    :title="title"
    :show="true"
    :cancel-action-label="$t('common.buttons.cancel')"
    :submit-action-label="isEditMode? $t('common.apply'): $t('common.add')"
    :content-only-scrolling="true"
    :persistent="true"
    :max-width="750"
    :min-height="530"
    @cancel="$emit('close')"
    @close="$emit('close')"
    @submit="onSubmit">
    <v-container>
      <ValidationObserver ref="form" slim>
        <v-row justify="center">
          <v-col cols="12" class="pa-0">
            <language-tabs :language="languageMode" @click="setLanguageMode" />

            <v-row class="pt-4">
              <v-col cols="8" md="8" sm="12" class="pr-md-6 pr-xl-6 pr-lg-6 pb-0">
                <v-text-field-with-validation
                  v-model="callCentre.name.translation[languageMode]"
                  data-test="callCentre-name"
                  :label="`${$t('eventSummary.callCentre.name')}*`"
                  :rules="rules.name"
                  @input="checkNameUniqueness($event)" />
              </v-col>

              <v-col cols="4" md="4" sm="12">
                <div :class="['status', isActive ? 'status_success': 'grey' ]">
                  <div class="pl-4 white--text" sm="12" md="9">
                    {{ $t('eventSummary.status') }}
                    <span class="rc-body14 fw-bold white--text text-uppercase" data-test="callCentre-status">
                      {{ statusName }}
                    </span>
                  </div>

                  <v-switch
                    v-model="isActive"
                    data-test="callcentre-switch-status"
                    class="pt-0 mt-0"
                    height="48"
                    hide-details
                    color="white"
                    flat
                    @change="updateStatus($event)" />
                </div>
              </v-col>
            </v-row>

            <v-row>
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

            <v-row>
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
      </ValidationObserver>
    </v-container>
  </rc-dialog>
</template>

<script lang='ts'>
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import _includes from 'lodash/includes';
import {
  RcDialog,
  VTextFieldWithValidation,
  VDateFieldWithValidation,
  VTextAreaWithValidation,
} from '@crctech/component-library';
import helpers from '@/ui/helpers';

import { VForm } from '@/types';
import { EEventCallCentreStatus, Event, IEventCallCentre } from '@/entities/event';
import _cloneDeep from 'lodash/cloneDeep';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import entityUtils from '@/entities/utils';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@/constants/validations';

export default Vue.extend({
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
      type: Event,
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
      originalCallCentre: null as IEventCallCentre,
      localEvent: _cloneDeep(this.event),
      isActive: false,
      getStringDate: helpers.getStringDate,
      isNameUnique: true,
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
      // use the English name of the call center as identifier, as call centre names are supposed to be unique for an event
      const callCentre = this.event.callCentres.find((centre) => centre.name.translation.en === this.id);
      this.originalCallCentre = callCentre;
      this.callCentre = _cloneDeep(callCentre);
      this.callCentre.startDate = callCentre.startDate ? this.getStringDate(callCentre.startDate) : null;
      this.callCentre.endDate = callCentre.endDate ? this.getStringDate(callCentre.endDate) : null;
      this.isActive = callCentre.status === EEventCallCentreStatus.Active;
    } else {
      const emptyCentre = this.emptyCallCentre;
      emptyCentre.name = entityUtils.initMultilingualAttributes();
      emptyCentre.details = entityUtils.initMultilingualAttributes();
      this.callCentre = emptyCentre;
    }
  },

  methods: {
    checkNameUniqueness(name: string) {
      let otherCentres = this.event.callCentres;
      if (this.isEditMode) {
        otherCentres = this.event.callCentres.filter((centre) => centre.name.translation.en !== this.originalCallCentre.name.translation.en);
      }
      const nameExists = otherCentres.some((centre) => _includes(centre.name.translation, name));
      this.isNameUnique = !nameExists;
    },

    fillEmptyMultilingualFields() {
      this.callCentre.name = entityUtils.getFilledMultilingualField(this.callCentre.name);
      this.callCentre.details = entityUtils.getFilledMultilingualField(this.callCentre.details);
    },

    makePayload() {
      this.fillEmptyMultilingualFields();
      this.callCentre.startDate = this.callCentre.startDate ? new Date(this.callCentre.startDate).toISOString() : null;
      this.callCentre.endDate = this.callCentre.endDate ? new Date(this.callCentre.endDate).toISOString() : null;
    },

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.makePayload();

        if (this.isEditMode) {
          this.$storage.event.actions.editCallCentre(
            {
              eventId: this.event.id,
              payload: { updatedCallCentre: this.callCentre, originalCallCentre: this.originalCallCentre },
            },
          );
        } else {
          this.$storage.event.actions.addCallCentre({ eventId: this.event.id, payload: this.callCentre });
        }
        this.$emit('close');
      }
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
