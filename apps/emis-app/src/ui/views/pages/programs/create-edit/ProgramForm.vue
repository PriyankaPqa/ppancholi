<template>
  <rc-page-loading v-if="loading" />
  <v-container v-else>
    <validation-observer ref="form">
      <v-row justify="center">
        <v-col cols="12" xl="8" lg="9" md="11">
          <language-tabs :language="languageMode" @click="setLanguageMode" />

          <v-row class="mt-4">
            <v-col cols="12" lg="8">
              <v-text-field-with-validation
                v-model="localProgram.name.translation[languageMode]"
                :rules="rules.name"
                :label="$t('event.programManagement.programName')"
                data-test="program-name"
                @input="resetAsUnique" />
            </v-col>

            <v-col cols="12" lg="4">
              <div :class="['program-status mb-0', statusColor]">
                <div>
                  <span class="fw-light">
                    {{ $t('common.status') }}
                  </span>

                  <span class="fw-medium text-uppercase mr-2" data-test="program-status-name">
                    {{ isStatusActive ? $t('common.program_status.Active') : $t('common.program_status.Inactive') }}
                  </span>
                </div>

                <v-switch
                  v-model="isStatusActive"
                  data-test="program-status-toggle"
                  :aria-label="$t('common.status')"
                  class="pt-0 mt-0"
                  hide-details
                  color="white"
                  flat />
              </div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="pt-0">
              <v-select-with-validation
                v-model="localProgram.paymentModalities"
                :items="paymentModalities"
                :rules="rules.paymentModalities"
                multiple
                :label="$t('event.programManagement.paymentModalities')"
                data-test="payment-modalities" />
            </v-col>
          </v-row>

          <div class="grey-container pa-4 mt-2">
            <div class="rc-body-16 fw-bold">
              {{ $t('event.programManagement.eligibilityCriteria') }}
            </div>

            <v-row>
              <v-col cols="12" md="4">
                <v-checkbox
                  v-model="localProgram.eligibilityCriteria.authenticated"
                  data-test="program-eligibility-authenticated"
                  :label="$t('event.programManagement.needAuthenticated')" />
              </v-col>

              <v-col cols="12" md="4">
                <v-checkbox
                  v-model="localProgram.eligibilityCriteria.impacted"
                  data-test="program-eligibility-impacted"
                  :label="$t('event.programManagement.needImpacted')" />
              </v-col>

              <v-col cols="12" md="4">
                <v-checkbox
                  v-model="localProgram.eligibilityCriteria.completedAssessments"
                  data-test="program-eligibility-hasCompletedAssessments"
                  :label="$t('event.programManagement.hasCompletedAssessments')"
                  :disabled="!isEditMode || assessmentForms.length === 0" />
                <v-select-with-validation
                  v-model="localProgram.eligibilityCriteria.completedAssessmentIds"
                  :items="assessmentFormItems"
                  :rules="rules.assessmentForms"
                  multiple
                  :label="$t('event.programManagement.selectAssessment')"
                  data-test="program-selectAssessment"
                  :disabled="!isEditMode || assessmentForms.length === 0 || !localProgram.eligibilityCriteria.completedAssessments"
                  background-color="white" />
              </v-col>
            </v-row>
          </div>

          <div class="grey-container px-4 py-1 my-8">
            <v-checkbox
              v-model="localProgram.approvalRequired"
              :disabled="localProgram.useForLodging"
              data-test="program-approvalRequired"
              :label="$t('event.programManagement.approvalRequired')" />

            <v-checkbox
              v-if="$hasFeature(FeatureKeys.Lodging)"
              v-model="localProgram.useForLodging"
              data-test="program-useForLodging"
              :label="$t('event.programManagement.setAsLodging')" />
          </div>

          <v-row>
            <v-col cols="12">
              <v-text-area-with-validation
                v-model="localProgram.description.translation[languageMode]"
                :rules="rules.description"
                :label="$t('event.programManagement.programDescription')"
                data-test="program-description" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </validation-observer>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import _orderBy from 'lodash/orderBy';
import {
  VSelectWithValidation,
  VTextFieldWithValidation,
  VTextAreaWithValidation,
  RcPageLoading,
} from '@libs/component-lib/components';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import { EPaymentModalities, ProgramEntity } from '@libs/entities-lib/program';
import helpers from '@/ui/helpers/helpers';
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { Status } from '@libs/shared-lib/types';
import { IAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
import { useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';

export default Vue.extend({
  name: 'ProgramForm',

  components: {
    LanguageTabs,
    VSelectWithValidation,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    RcPageLoading,
  },

  props: {
    isEditMode: {
      type: Boolean,
      required: true,
    },

    program: {
      type: Object as () => ProgramEntity,
      required: true,
    },

    isNameUnique: {
      type: Boolean,
      required: true,
    },

    isDirty: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    const localProgram = _cloneDeep(this.program);

    return {
      loading: true,
      localProgram,
      languageMode: 'en',
      assessmentForms: [] as IAssessmentFormEntity[],
      FeatureKeys,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
          customValidator: { isValid: this.isNameUnique, messageKey: 'validations.alreadyExists' },
        },
        paymentModalities: {
          required: true,
        },
        description: {
          required: true,
          max: MAX_LENGTH_LG,
        },
        assessmentForms: {
          required: this.localProgram.eligibilityCriteria.completedAssessments,
        },
      };
    },

    isStatusActive: {
      get(): boolean {
        return this.localProgram.status === Status.Active;
      },

      set(value: boolean) {
        this.localProgram.status = value ? Status.Active : Status.Inactive;
      },
    },

    statusColor(): string {
      if (this.isStatusActive) {
        return 'status_success white--text';
      }
      return 'status_green_pale black--text';
    },

    paymentModalities(): Array<{ text: string, value: unknown }> {
      const paymentModalities = helpers.enumToTranslatedCollection(EPaymentModalities, 'enums.PaymentModality');
      return _orderBy(paymentModalities, 'text');
    },

    assessmentFormItems(): Array<{ text: string, value: string }> {
      const items = [] as Array<{ text: string, value: string }>;
      this.assessmentForms.forEach((x) => {
        let text = this.$m(x.name);
        if (x.status === Status.Inactive) {
          text += ` (${this.$t('enums.Status.Inactive')})`;
        }

        items.push({ text, value: x.id });
      });

      return _orderBy(items, 'text');
    },
  },

  watch: {
    localProgram: {
      handler(newProgram) {
        // if program is use for lodging then it cannot be approval required
        if (newProgram.useForLodging === true) {
          this.localProgram.approvalRequired = false;
        }

        this.$emit('update:program', newProgram);
        this.$emit('update:is-dirty', true);
      },
      deep: true,
    },
  },

  async created() {
    if (this.isEditMode) {
      try {
        this.loading = true;
        this.assessmentForms = await useAssessmentFormStore().fetchByProgramId(this.localProgram.id);
      } finally {
        this.loading = false;
      }
    } else {
      this.loading = false;
    }
  },

  methods: {
    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.localProgram.fillEmptyMultilingualAttributes();
    },

    resetAsUnique() {
      if (!this.isNameUnique) {
        this.$emit('update:is-name-unique', true);
      }
    },
  },
});
</script>

<style scoped lang="scss">
.program-status {
  display: flex;
  align-items: center;
  padding: 10px;
  justify-content: space-between;
  margin-bottom: 20px;
  border-radius: 7px;
  height: 56px;
}
</style>
