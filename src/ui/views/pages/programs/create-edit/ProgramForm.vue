<template>
  <v-container>
    <ValidationObserver ref="form">
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

                  <span class="fw-medium text-uppercase mr-2">
                    {{ isStatusActive ? $t('common.program_status.Active') : $t('common.program_status.Inactive') }}
                  </span>
                </div>

                <v-switch
                  v-model="isStatusActive"
                  data-test="program-status"
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
                  :label="$t('event.programManagement.needAuthenticated')" />
              </v-col>

              <v-col cols="12" md="4">
                <v-checkbox
                  v-model="localProgram.eligibilityCriteria.impacted"
                  :label="$t('event.programManagement.needImpacted')" />
              </v-col>

              <v-col cols="12" md="4">
                <v-checkbox
                  v-model="localProgram.eligibilityCriteria.completedAssessments"
                  :label="$t('event.programManagement.hasCompletedAssessments')" />
                <v-select-with-validation
                  :label="$t('event.programManagement.selectAssessment')"
                  disabled
                  background-color="white"
                  hide-details />
              </v-col>
            </v-row>
          </div>

          <div class="grey-container px-4 py-1 my-8">
            <v-checkbox
              v-model="localProgram.approvalRequired"
              :label="$t('event.programManagement.approvalRequired')" />
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
    </ValidationObserver>
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
} from '@crctech/component-library';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import { EPaymentModalities, EProgramStatus, Program } from '@/entities/program';
import helpers from '@/ui/helpers';
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@/constants/validations';

export default Vue.extend({
  name: 'ProgramForm',

  components: {
    LanguageTabs,
    VSelectWithValidation,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
  },

  props: {
    isEditMode: {
      type: Boolean,
      required: true,
    },

    program: {
      type: Program,
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
      localProgram,
      languageMode: 'en',
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
      };
    },

    isStatusActive: {
      get(): boolean {
        return this.localProgram.programStatus === EProgramStatus.Active;
      },

      set(value: boolean) {
        this.localProgram.programStatus = value ? EProgramStatus.Active : EProgramStatus.Inactive;
      },
    },

    statusColor(): string {
      if (this.isStatusActive) return 'status_success white--text';
      return 'status_green_pale black--text';
    },

    paymentModalities(): Array<{ text: string, value: unknown }> {
      const paymentModalities = helpers.enumToTranslatedCollection(EPaymentModalities, 'event.programManagement.paymentModalities');
      return _orderBy(paymentModalities, 'text');
    },
  },

  watch: {
    localProgram: {
      handler(newProgram) {
        this.$emit('update:program', newProgram);
        this.$emit('update:is-dirty', true);
      },
      deep: true,
    },
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
