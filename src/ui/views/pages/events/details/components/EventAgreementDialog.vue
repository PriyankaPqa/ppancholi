<template>
  <ValidationObserver ref="form" v-slot="{ failed, pristine }" slim>
    <rc-dialog
      :title="title"
      :show="true"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="isEditMode? $t('common.save'): $t('common.add')"
      :content-only-scrolling="true"
      :persistent="true"
      :max-width="750"
      :min-height="600"
      :loading="loading"
      :submit-button-disabled="failed || (isEditMode && pristine)"
      @cancel="$emit('close')"
      @close="$emit('close')"
      @submit="onSubmit">
      <v-container>
        <v-row class="justify-center">
          <v-col cols="12" class="pa-0">
            <language-tabs :language="languageMode" @click="setLanguageMode" />

            <v-row class="pt-4">
              <v-col cols="6" md="6" sm="12" class="pr-md-6 pr-xl-6 pr-lg-6 pb-0">
                <v-select-with-validation
                  v-model="agreementType"
                  data-test="agreement-agreementType"
                  :label="`${$t('eventSummary.agreement.agreementType')}*`"
                  :items="allAgreementTypes"
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
                  @input="checkNameUniqueness($event)" />
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
                  :rules="rules.details" />
              </v-col>
            </v-row>

            <v-row class="mt-0">
              <v-col cols="6" sm="12" md="6" class="pb-0">
                <v-date-field-with-validation
                  v-model="agreement.startDate"
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
                  :close-on-content-click="false"
                  :data-test="'agreement-end-date'"
                  :rules="rules.endDate"
                  prepend-inner-icon="mdi-calendar"
                  :label="$t('eventSummary.agreement.endDate')"
                  :placeholder="$t('eventSummary.agreement.endDate')"
                  :min="dayAfterStartDate"
                  :picker-date="agreement.startDate" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </rc-dialog>
  </ValidationObserver>
</template>

<script lang='ts'>
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import moment from '@/ui/plugins/moment';
import _includes from 'lodash/includes';
import {
  RcDialog,
  VTextFieldWithValidation,
  VDateFieldWithValidation,
  VTextAreaWithValidation,
  VSelectWithValidation,
} from '@crctech/component-library';
import helpers from '@/ui/helpers';

import { VForm } from '@/types';
import { Event, IEventAgreementInfos } from '@/entities/event';
import _cloneDeep from 'lodash/cloneDeep';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import entityUtils from '@/entities/utils';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@/constants/validations';
import { IOptionItem, IOptionItemData } from '@/entities/optionItem';

export default Vue.extend({
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
    agreementTypes: {
      type: Array as ()=> Array<IOptionItemData>,
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
      agreement: null as IEventAgreementInfos,
      originalAgreement: null as IEventAgreementInfos,
      initialInactiveAgreementType: null,
      agreementType: null,
      getStringDate: helpers.getStringDate,
      isNameUnique: true,
      loading: false,
    };
  },

  computed: {
    allAgreementTypes(): IOptionItem[] {
      if (this.initialInactiveAgreementType) {
        return [
          ...this.agreementTypes,
          this.initialInactiveAgreementType,
        ];
      }

      return this.agreementTypes;
    },

    dayAfterStartDate(): string {
      if (!this.agreement.startDate) return null;
      return (moment(this.agreement.startDate).clone().add(1, 'days').format('YYYY-MM-DD'));
    },

    endDateRule(): Record<string, unknown> {
      if (this.agreement && this.agreement.startDate && this.agreement.endDate) {
        return {
          mustBeAfterOrSame: {
            X: this.agreement.endDate,
            Y: this.dayAfterStartDate,
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
      // use the English name of the agreement as identifier, as call centre names are supposed to be unique for an event
      const agreement = this.event.agreements?.find((agr) => agr.name.translation.en === this.id);
      if (agreement) {
        this.originalAgreement = agreement;
        this.agreement = _cloneDeep(agreement);
        this.agreement.startDate = agreement.startDate ? this.getStringDate(agreement.startDate) : null;
        this.agreement.endDate = agreement.endDate ? this.getStringDate(agreement.endDate) : null;

        if (agreement.agreementType.optionItemId) {
          this.initAgreementTypes(agreement);
        }
      } else {
        this.agreement = this.emptyAgreement;
        this.$toasted.global.error(this.$t('error.unexpected_error'));
        this.error = true;
      }
    } else {
      const { emptyAgreement } = this;
      emptyAgreement.name = entityUtils.initMultilingualAttributes();
      emptyAgreement.details = entityUtils.initMultilingualAttributes();

      this.agreement = emptyAgreement;

      // Set the default agreement type
      const defaultAgreementType = this.agreementTypes.find((t) => t.isDefault);

      if (defaultAgreementType) {
        this.agreement.agreementType.optionItemId = defaultAgreementType.id;
        this.agreementType = defaultAgreementType;
      }
    }
  },

  methods: {
    checkNameUniqueness(name: string) {
      let otherAgreements = this.event.agreements;
      if (this.isEditMode) {
        otherAgreements = this.event.agreements.filter((agr) => agr.name.translation.en !== this.originalAgreement.name.translation.en);
      }
      const nameExists = otherAgreements.some((agr) => _includes(agr.name.translation, name));
      this.isNameUnique = !nameExists;
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
          if (this.isEditMode) {
            await this.$storage.event.actions.editAgreement(
              {
                eventId: this.event.id,
                payload: { updatedAgreement: this.agreement, originalAgreement: this.originalAgreement },
              },
            );
          } else {
            await this.$storage.event.actions.addAgreement({ eventId: this.event.id, payload: this.agreement });
          }
        } finally {
          this.loading = false;
          this.$emit('close');
        }
      }
    },

    setAgreementType(type: IOptionItemData) {
      this.agreement.agreementType.optionItemId = type.id;
    },

    initAgreementTypes(agreement: IEventAgreementInfos) {
      const activeAgreementType = this.agreementTypes.find((type) => type.id === agreement.agreementType.optionItemId);

      if (activeAgreementType) {
        this.agreementType = activeAgreementType;
      } else {
        this.agreementType = {
          id: this.agreement.agreementType.optionItemId,
          name: this.agreement.agreementTypeName,
        };
        this.initialInactiveAgreementType = { ...this.agreementType };
      }
    },

    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.fillEmptyMultilingualFields();
    },

  },
});

</script>
