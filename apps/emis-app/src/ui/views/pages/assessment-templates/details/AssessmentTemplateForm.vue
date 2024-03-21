<template>
  <v-container>
    <validation-observer ref="form">
      <v-row justify="center">
        <v-col cols="12" xl="8" lg="9" md="11">
          <language-tabs :language="languageMode" @click="setLanguageMode" />

          <v-row class="mt-4">
            <v-col cols="8">
              <v-text-field-with-validation
                v-model="localAssessment.name.translation[languageMode]"
                data-test="assessment-name"
                :label="`${$t('assessmentTemplate.name')} *`"
                :rules="rules.name"
                @input="resetAsUnique()" />
            </v-col>
            <v-col cols="4">
              <div v-if="isFormMode && programInactive" class="flex-row status py-2 pl-4 grey lighten-3 black--text">
                <span class="rc-body14">
                  {{ $t('assessmentForm.programIsInactive') }}
                </span>
              </div>

              <div v-else :class="['status', isStatusActive ? 'status_success' : 'rc-grey-background']">
                <div class="pl-5 white--text">
                  {{ $t('common.status') }}
                  <span class="rc-body14 fw-bold white--text text-uppercase" :data-test="`assessment-status`">
                    {{ $t(`enums.Status.${Status[localAssessment.status]}`) }}
                  </span>
                </div>

                <validation-provider>
                  <v-switch
                    v-model="isStatusActive"
                    data-test="assessment-switch-status"
                    :aria-label="`${$t('common.status')} ${$t(`enums.Status.${Status[localAssessment.status]}`)}`"
                    class="pt-0 mt-0"
                    hide-details
                    color="white"
                    flat />
                </validation-provider>
              </div>
            </v-col>
          </v-row>

          <v-row v-if="isFormMode">
            <v-col cols="12">
              <v-autocomplete-with-validation
                v-model="localAssessment.programId"
                :items="programsSorted"
                :label="$t('assessmentTemplate.associate_program')"
                :item-text="(item) => $m(item.name)"
                :item-value="(item) => item.id"
                clearable
                data-test="assessmentTemplate__programSelect" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-area-with-validation
                v-model="localAssessment.description.translation[languageMode]"
                data-test="assessment-description"
                full-width
                clearable
                :aria-label="$t('common.description')"
                :label="$t('common.description')"
                :rules="rules.description"
                @click:clear="clearDescription()" />
            </v-col>
          </v-row>

          <div class="grey-container mb-6 px-6">
            <v-row class="border-bottom">
              <v-col cols="12" class="d-flex justify-space-between align-center">
                <div class="rc-body14 fw-bold">
                  {{ $t('assessmentTemplate.published') }}
                </div>
                <div class="d-flex">
                  <span class="rc-body14 fw-bold pr-4" :data-test="`assessment-publishstatus`">
                    {{ $t(`enums.assessmentPublishStatus.${PublishStatus[localAssessment.publishStatus]}`) }}
                  </span>

                  <validation-provider>
                    <v-switch
                      v-model="isPublished"
                      data-test="assessment-switch-publishstatus"
                      :aria-label="$t('assessmentTemplate.published')"
                      class="pt-0 mt-0"
                      hide-details
                      flat />
                  </validation-provider>
                </div>
              </v-col>
            </v-row>

            <v-row class="border-bottom">
              <v-col cols="12" class="d-flex justify-space-between align-center">
                <div class="rc-body14 fw-bold">
                  {{ $t('assessmentTemplate.savePartialSurveyResults') }}
                </div>
                <div>
                  <validation-provider>
                    <v-checkbox
                      v-model="localAssessment.savePartialSurveyResults"
                      class="mt-0"
                      :aria-label="$t('assessmentTemplate.savePartialSurveyResults')"
                      hide-details
                      data-test="save-partial-survey-results" />
                  </validation-provider>
                </div>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" class="d-flex justify-space-between align-center">
                <div class="rc-body14 fw-bold">
                  {{ isFormMode ? $t('assessmentForm.frequency') : $t('assessmentTemplate.frequency') }}
                </div>
                <div class="d-flex">
                  <validation-provider v-slot="{ errors }" :rules="rules.frequency">
                    <v-radio-group v-model="localAssessment.frequency" :error-messages="errors" class="mt-0" row>
                      <v-radio
                        :label="$t('enums.assessmentFrequencyType.OneTime')"
                        data-test="assessment-form-frequency-oneTime"
                        :value="Frequency.OneTime" />
                      <v-radio
                        :label="$t('enums.assessmentFrequencyType.Multiple')"
                        data-test="assessment-form-frequency-multiple"
                        :value="Frequency.Multiple" />
                    </v-radio-group>
                  </validation-provider>
                </div>
              </v-col>
            </v-row>
          </div>

          <v-row>
            <v-col cols="12">
              <v-text-area-with-validation
                v-model="localAssessment.messageIfUnavailable.translation[languageMode]"
                data-test="assessment-messageIfUnavailable"
                full-width
                clearable
                :aria-label="$t('assessmentTemplate.messageIfUnavailable')"
                :label="$t('assessmentTemplate.messageIfUnavailable')"
                :rules="rules.messageIfUnavailable"
                @click:clear="clearMessage()" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <div class="fw-bold rc-body16">
                {{ $t('assessmentTemplate.configureScoring') }}
              </div>
              <v-sheet rounded outlined>
                <v-simple-table class="scoring-table">
                  <thead>
                    <tr>
                      <th width="150px">
                        {{ $t('assessmentTemplate.minValue') }}
                      </th>
                      <th width="150px">
                        {{ $t('assessmentTemplate.maxValue') }}
                      </th>
                      <th>
                        {{ $t('assessmentTemplate.stepLabel') }}
                      </th>
                      <th width="100px">
                        {{ $t('assessmentTemplate.restrictFinancial') }}
                      </th>
                      <th class="rc-transparent-text">
                        {{ $t('common.delete') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(scoringRange, $index) in localAssessment.scoringRanges"
                      :key="$index"
                      :data-test="`scoringRange${$index}`">
                      <td>
                        <v-text-field-with-validation
                          v-model="scoringRange.minValue"
                          dense
                          small
                          type="number"
                          background-color="white"
                          :rules="{ required: true, numeric: true, customValidator: isRangeValid($index) }"
                          :label="$t('assessmentTemplate.minValue') + '*'" />
                      </td>
                      <td>
                        <v-text-field-with-validation
                          v-model="scoringRange.maxValue"
                          dense
                          small
                          type="number"
                          background-color="white"
                          :rules="{ required: true, numeric: true }"
                          :label="$t('assessmentTemplate.maxValue') + '*'" />
                      </td>
                      <td>
                        <v-text-field-with-validation
                          v-model="scoringRange.label.translation[languageMode]"
                          dense
                          small
                          background-color="white"
                          :rules="rules.scoringLabel"
                          :label="$t('assessmentTemplate.stepLabel') + '*'" />
                      </td>
                      <td>
                        <v-checkbox-with-validation
                          v-model="scoringRange.restrictFinancial"
                          :aria-label="$t('assessmentTemplate.restrictFinancial')"
                          dense />
                      </td>
                      <td>
                        <v-btn class="ml-3" icon data-test="cancel" :aria-label="$t('common.delete')" @click="deleteScoring(scoringRange)">
                          <v-icon size="20">
                            mdi-delete
                          </v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <td colspan="4">
                      <v-btn color="primary" small @click="addNewScoring()">
                        <v-icon left>
                          mdi-plus
                        </v-icon>
                        {{ $t('assessmentTemplate.addScoring') }}
                      </v-btn>
                    </td>
                  </tfoot>
                </v-simple-table>
              </v-sheet>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </validation-observer>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  VTextFieldWithValidation,
  VTextAreaWithValidation,
  VAutocompleteWithValidation,
  VCheckboxWithValidation,
} from '@libs/component-lib/components';
import { MAX_LENGTH_MD, MAX_LENGTH_LG, MAX_LENGTH_SM, MAX_LENGTH_XL } from '@libs/shared-lib/constants/validations';
import {
  AssessmentBaseEntity, IAssessmentBaseEntity, IAssessmentFormEntity, PublishStatus, AssessmentTemplateEntity, AssessmentFormEntity,
  AssessmentFrequencyType, IAssessmentScoringRange,
} from '@libs/entities-lib/assessment-template';
import { Status } from '@libs/entities-lib/base';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import { IProgramEntity, IdParams } from '@libs/entities-lib/program';
import _sortBy from 'lodash/sortBy';
import utils from '@libs/entities-lib/utils';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { useProgramStore } from '@/pinia/program/program';
import { EFilterKeyType } from '@libs/component-lib/types';

export default Vue.extend({
  name: 'AssessmentTemplateForm',

  components: {
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    VAutocompleteWithValidation,
    VCheckboxWithValidation,
    LanguageTabs,
  },

  props: {
    isEditMode: {
      type: Boolean,
      required: true,
    },

    assessmentTemplate: {
      type: Object as () => IAssessmentBaseEntity,
      required: true,
    },

    isNameUnique: {
      type: Boolean,
      required: true,
    },

    showEligibilityCriteriaWarning: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      localAssessment: null as AssessmentBaseEntity,
      languageMode: 'en',
      Status,
      PublishStatus,
      Frequency: AssessmentFrequencyType,
      programs: [] as IProgramEntity[],
      isSelectedAsProgramEligibilityCriteria: false,
      originalAssessmentFormProgramId: null as string,
      originalAssessmentFormStatus: Status.Active,
      combinedProgramStore: new CombinedStoreFactory<IProgramEntity, null, IdParams>(useProgramStore()),
    };
  },

  computed: {
    isFormMode() : boolean {
      return !!(this.assessmentTemplate as IAssessmentFormEntity).eventId;
    },

    isStatusActive: {
      get(): boolean {
        return this.localAssessment.status === Status.Active;
      },

      set(value: boolean) {
        this.localAssessment.status = value ? Status.Active : Status.Inactive;
      },
    },

    programsSorted(): Array<IProgramEntity> {
      return _sortBy(this.programs, (program) => this.$m(program.name));
    },

    /**
     * Returns true if the program status is Inactive
     */
    programInactive(): boolean {
      if (this.isFormMode) {
        const assessmentForm = this.localAssessment as AssessmentFormEntity;
        const program = this.programs.filter((p) => p.id === assessmentForm.programId)[0];

        return program && program.status === Status.Inactive;
      }

      return false;
    },

    isPublished: {
      get(): boolean {
        return this.localAssessment.publishStatus === PublishStatus.Published;
      },

      set(value: boolean) {
        this.localAssessment.publishStatus = value ? PublishStatus.Published : PublishStatus.Unpublished;
      },
    },

    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
          customValidator: { isValid: this.isNameUnique, messageKey: 'validations.alreadyExists' },
        },
        description: {
          max: MAX_LENGTH_LG,
        },
        messageIfUnavailable: {
          max: MAX_LENGTH_XL,
        },
        frequency: {
          required: this.isFormMode,
        },
        scoringLabel: {
          required: true,
          max: MAX_LENGTH_SM,
        },
      };
    },
  },

  watch: {
    localAssessment: {
      handler(newAssessmentTemplate) {
        this.$emit('update:assessmentTemplate', newAssessmentTemplate);

        if (this.isFormMode && this.isSelectedAsProgramEligibilityCriteria) {
          const newAssessmentForm = newAssessmentTemplate as AssessmentFormEntity;
          if (newAssessmentForm.programId !== this.originalAssessmentFormProgramId
              || (newAssessmentForm.status !== this.originalAssessmentFormStatus && newAssessmentForm.status === Status.Inactive)) {
            this.$emit('update:show-eligibility-criteria-warning', true);
          } else {
            this.$emit('update:show-eligibility-criteria-warning', false);
          }
        }
      },
      deep: true,
    },
  },

  async created() {
    if (this.isFormMode) {
      this.localAssessment = new AssessmentFormEntity(this.assessmentTemplate as IAssessmentFormEntity);
      const assessmentForm = this.localAssessment as AssessmentFormEntity;
      this.originalAssessmentFormProgramId = assessmentForm.programId;
      this.originalAssessmentFormStatus = assessmentForm.status;
    } else {
      this.localAssessment = new AssessmentTemplateEntity(this.assessmentTemplate);
    }

    await this.searchPrograms();

    this.setIsSelectedAsProgramEligibilityCriteria();
  },

  methods: {
    setLanguageMode(lang: string) {
      this.languageMode = lang;
      this.localAssessment.fillEmptyMultilingualAttributes();
    },

    resetAsUnique() {
      if (!this.isNameUnique) {
        this.$emit('update:is-name-unique', true);
      }
    },

    setIsSelectedAsProgramEligibilityCriteria() {
      if (this.isFormMode) {
        const program = this.programs.filter((p) => p.id === this.originalAssessmentFormProgramId)[0];

        this.isSelectedAsProgramEligibilityCriteria = program && program.eligibilityCriteria.completedAssessmentIds.some((caid) => caid === this.localAssessment.id);
      } else {
        this.isSelectedAsProgramEligibilityCriteria = false;
      }
    },

    clearDescription() {
      this.localAssessment.description = utils.initMultilingualAttributes();
    },

    clearMessage() {
      this.localAssessment.messageIfUnavailable = utils.initMultilingualAttributes();
    },

    async searchPrograms() {
      const form = this.assessmentTemplate as IAssessmentFormEntity;
      if (form.eventId) {
        const tableData = await this.combinedProgramStore.search({
          filter: {
            'Entity/EventId': { value: form.eventId, type: EFilterKeyType.Guid },
          },
        }, null, true, true);

        if (!tableData) {
          return;
        }
        this.programs = this.combinedProgramStore.getByIds(tableData.ids).map((t) => t.entity)
          .filter((t) => t.status === Status.Active || t.id === form.programId);
      }
    },

    deleteScoring(scoringRange: IAssessmentScoringRange) {
      this.localAssessment.scoringRanges = this.localAssessment.scoringRanges.filter((x) => x !== scoringRange);
      this.$emit('update:data-removed', true);
    },

    addNewScoring() {
      this.localAssessment.scoringRanges.push({
        label: utils.initMultilingualAttributes(),
        maxValue: null,
        minValue: null,
        restrictFinancial: false,
      });
    },

    isRangeValid(index: number) {
      const scoring = this.localAssessment.scoringRanges[index];
      // covered by required - we dont need to show errors for invalid ranges while data isnt inputted...
      if (!scoring.minValue?.toString().length || !scoring.maxValue?.toString().length) {
        return { isValid: true };
      }

      if (+scoring.minValue > +scoring.maxValue) {
        return { isValid: false, messageKey: 'assessmentTemplate.invalidRange' };
      }

      if (this.localAssessment.scoringRanges.some((x) => x !== scoring && x.minValue?.toString().length
        && +x.minValue >= +scoring.minValue && +x.minValue <= +scoring.maxValue)) {
        return { isValid: false, messageKey: 'assessmentTemplate.rangeOverlap' };
      }

      return { isValid: true };
    },
  },
});
</script>

<style scoped lang="scss">
 .border-bottom {
   border-bottom: 1px solid var(--v-grey-lighten2);
 }

 ::v-deep .v-text-field__details {
    min-height: 0 !important;
    margin-bottom: 0 !important;
  }

  .scoring-table td {
    padding: 6px !important;
  }
</style>
