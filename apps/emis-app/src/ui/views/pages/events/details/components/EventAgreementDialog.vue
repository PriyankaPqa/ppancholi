<template>
  <validation-observer ref="form" v-slot="{ failed, pristine }" slim>
    <rc-dialog
      :title="title"
      :show="true"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="isEditMode ? $t('common.save') : $t('common.add')"
      :content-only-scrolling="true"
      :persistent="true"
      :max-width="750"
      :min-height="610"
      :loading="loading"
      :submit-button-disabled="failed || (isEditMode && pristine)"
      @cancel="$emit('close')"
      @close="$emit('close')"
      @submit="onSubmit">
      <v-container>
        <v-row v-if="agreement" class="justify-center">
          <v-col cols="12" class="pa-0">
            <language-tabs :language="languageMode" @click="setLanguageMode" />

            <v-row class="pt-4">
              <v-col cols="6" md="6" sm="12" class="pr-md-6 pr-xl-6 pr-lg-6 pb-0">
                <v-select-with-validation
                  v-model="agreementType"
                  data-test="agreement-agreementType"
                  :label="`${$t('eventSummary.agreement.agreementType')}*`"
                  :items="agreementTypes"
                  :item-text="(item) => $m(item.name)"
                  return-object
                  :rules="rules.agreementType"
                  @change="setAgreementType($event)" />
              </v-col>
              <v-col v-if="agreementType && agreementType.isOther" cols="6" md="6" sm="12" class="pb-0">
                <v-text-field-with-validation
                  v-model="agreement.agreementType.specifiedOther"
                  data-test="agreement-type-specifiedOther"
                  :label="`${$t('common.pleaseSpecify')}*`"
                  :rules="rules.agreementTypeOther" />
              </v-col>
            </v-row>

            <v-row class="mt-0">
              <v-col cols="12" class="pb-0">
                <v-text-field-with-validation
                  v-model="agreement.name.translation[languageMode]"
                  data-test="agreement-name"
                  :label="`${$t('eventSummary.agreement.name')}*`"
                  :rules="rules.name"
                  @input="resetAsUnique()" />
              </v-col>
            </v-row>

            <v-row class="mt-0">
              <v-col cols="12" class="pb-0">
                <v-text-area-with-validation
                  v-model="agreement.details.translation[languageMode]"
                  data-test="agreement-details"
                  full-width
                  rows="3"
                  :label="$t('eventSummary.agreement.details')"
                  :rules="rules.details"
                  clearable
                  @click:clear="clearDetails()" />
              </v-col>
            </v-row>

            <v-row class="mt-0">
              <v-col cols="6" sm="12" md="6" class="pb-0">
                <v-date-field-with-validation
                  v-model="agreement.startDate"
                  :locale="$i18n.locale"
                  :close-on-content-click="false"
                  data-test="agreement-start-date"
                  :rules="rules.startDate"
                  prepend-inner-icon="mdi-calendar"
                  :label="$t('eventSummary.agreement.startDate')"
                  :placeholder="$t('eventSummary.agreement.startDate')" />
              </v-col>

              <v-col cols="6" sm="12" md="6" class="pb-0">
                <v-date-field-with-validation
                  v-model="agreement.endDate"
                  :locale="$i18n.locale"
                  :close-on-content-click="false"
                  :data-test="'agreement-end-date'"
                  :rules="rules.endDate"
                  prepend-inner-icon="mdi-calendar"
                  :label="$t('eventSummary.agreement.endDate')"
                  :placeholder="$t('eventSummary.agreement.endDate')"
                  :min="agreement.startDate"
                  :picker-date="agreement.startDate" />
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
  VSelectWithValidation,
} from '@libs/component-lib/components';
import helpers from '@/ui/helpers/helpers';

import { EEventSummarySections } from '@/types';
import { VForm, IServerError } from '@libs/shared-lib/types';
import { IEventAgreement, IEventEntity } from '@libs/entities-lib/event';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import entityUtils from '@libs/entities-lib/utils';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';
import { useEventStore } from '@/pinia/event/event';

export default mixins(handleUniqueNameSubmitError).extend({

  name: 'EventAgreementDialog',

  components: {
    RcDialog,
    LanguageTabs,
    VTextFieldWithValidation,
    VDateFieldWithValidation,
    VTextAreaWithValidation,
    VSelectWithValidation,
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
      error: false,
      languageMode: 'en',
      emptyAgreement: {
        name: { translation: {} },
        startDate: null,
        endDate: null,
        details: { translation: {} },
        agreementType: { optionItemId: '', specifiedOther: '' },
        agreementTypeName: { translation: {} },
      },
      agreement: null as IEventAgreement,
      agreementType: null,
      getLocalStringDate: helpers.getLocalStringDate,
      loading: false,
    };
  },

  computed: {
    agreementTypes(): Array<IOptionItem> {
      return useEventStore().getAgreementTypes(true, this.isEditMode ? this.agreement.agreementType.optionItemId : null);
    },

    endDateRule(): Record<string, unknown> {
      if (this.agreement && this.agreement.startDate && this.agreement.endDate) {
        return {
          mustBeAfterOrSame: {
            X: this.agreement.endDate,
            Y: this.agreement.startDate,
          },
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
        agreementType: {
          required: true,
        },
        agreementTypeOther: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        endDate: {
          ...this.endDateRule,
        },
        details: {
          max: MAX_LENGTH_LG,
        },
      };
    },

    title(): TranslateResult {
      if (this.isEditMode) {
        return this.$t('eventSummary.editAgreement');
      }
      return this.$t('eventSummary.addAgreement');
    },
  },

  watch: {
    agreementType() {
      this.agreement.agreementType.specifiedOther = '';
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
      const { emptyAgreement } = this;
      emptyAgreement.name = entityUtils.initMultilingualAttributes();
      emptyAgreement.details = entityUtils.initMultilingualAttributes();

      this.agreement = emptyAgreement;

      // Set the default agreement type
      const defaultAgreementType = this.agreementTypes.find((t:IOptionItem) => t.isDefault);

      if (defaultAgreementType) {
        this.agreement.agreementType.optionItemId = defaultAgreementType.id;
        this.agreementType = defaultAgreementType;
      }
    },

    initEditMode() {
      const agreement = this.event.agreements?.find((agr: IEventAgreement) => agr.id === this.id);
      if (agreement) {
        this.agreement = _cloneDeep(agreement);
        this.agreement.startDate = agreement.startDate ? this.getLocalStringDate(agreement.startDate, 'EventAgreement.startDate') : null;
        this.agreement.endDate = agreement.endDate ? this.getLocalStringDate(agreement.endDate, 'EventAgreement.endDate') : null;

        if (agreement.agreementType.optionItemId) {
          this.agreementType = this.agreementTypes.find((type:IOptionItem) => type.id === agreement.agreementType.optionItemId);
        }
      }
    },

    fillEmptyMultilingualFields() {
      this.agreement.name = entityUtils.getFilledMultilingualField(this.agreement.name);
      this.agreement.details = entityUtils.getFilledMultilingualField(this.agreement.details);
    },

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.fillEmptyMultilingualFields();
        this.loading = true;

        try {
          await this.submitAgreement();
          this.$emit('close');
        } catch (e) {
          const errorData = (e as IServerError).response?.data?.errors;
          this.$appInsights.trackTrace('Event agreement dialog submit error', { error: errorData }, 'EventAgreementDialog', 'onSubmit');
          this.handleSubmitError(e);
        } finally {
          this.loading = false;
        }
      }
    },

    async submitAgreement() {
      await useEventStore().updateEventSection({
        eventId: this.event.id,
        payload: this.agreement,
        section: EEventSummarySections.Agreement,
        action: this.isEditMode ? 'edit' : 'add',
      });
    },

    setAgreementType(type: IOptionItem) {
      this.agreement.agreementType.optionItemId = type.id;
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.fillEmptyMultilingualFields();
    },

    clearDetails() {
      this.agreement.details = entityUtils.initMultilingualAttributes();
    },
  },
});

</script>
