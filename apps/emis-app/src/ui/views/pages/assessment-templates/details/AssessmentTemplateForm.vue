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
              <div :class="['status', isStatusActive ? 'status_success' : 'grey']">
                <div class="pl-4 white--text">
                  {{ $t('common.status') }}
                  <span class="rc-body14 fw-bold white--text text-uppercase" :data-test="`assessment-status`">
                    {{ $t(`enums.Status.${Status[localAssessment.status]}`) }}
                  </span>
                </div>

                <validation-provider>
                  <v-switch
                    v-model="isStatusActive"
                    data-test="assessment-switch-status"
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
                data-test="assessmentTemplate__programSelect" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-area-with-validation
                v-model="localAssessment.description.translation[languageMode]"
                data-test="assessment-description"
                full-width
                :label="$t('common.description')"
                :rules="rules.description" />
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
                        :value="Frequency.OneTime" />
                      <v-radio
                        :label="$t('enums.assessmentFrequencyType.Multiple')"
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
                :label="$t('assessmentTemplate.messageIfUnavailable')"
                :rules="rules.messageIfUnavailable" />
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
} from '@libs/component-lib/components';
import { MAX_LENGTH_MD, MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import {
  AssessmentBaseEntity, IAssessmentBaseEntity, IAssessmentFormEntity, PublishStatus, AssessmentTemplateEntity, AssessmentFormEntity,
  AssessmentFrequencyType,
} from '@libs/entities-lib/assessment-template';
import { Status } from '@libs/entities-lib/base';
import LanguageTabs from '@/ui/shared-components/LanguageTabs.vue';
import { IProgramEntity } from '@libs/entities-lib/program';
import _sortBy from 'lodash/sortBy';

export default Vue.extend({
  name: 'AssessmentTemplateForm',

  components: {
    VTextFieldWithValidation,
    VTextAreaWithValidation,
    VAutocompleteWithValidation,
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
  },

  data() {
    return {
      localAssessment: null as AssessmentBaseEntity,
      languageMode: 'en',
      Status,
      PublishStatus,
      Frequency: AssessmentFrequencyType,
      programs: [] as IProgramEntity[],
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
          max: MAX_LENGTH_LG,
        },
        frequency: {
          required: this.isFormMode,
        },
      };
    },
  },

  watch: {
    localAssessment: {
      handler(newAssessmentTemplate) {
        this.$emit('update:assessmentTemplate', newAssessmentTemplate);
      },
      deep: true,
    },
  },

  async created() {
    this.localAssessment = this.isFormMode
      ? new AssessmentFormEntity(this.assessmentTemplate as IAssessmentFormEntity) : new AssessmentTemplateEntity(this.assessmentTemplate);
    await this.searchPrograms();
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

    async searchPrograms() {
      const form = this.assessmentTemplate as IAssessmentFormEntity;
      if (form.eventId) {
        const tableData = await this.$storage.program.actions.search({
          filter: {
            'Entity/EventId': form.eventId,
          },
        }, null, true);

        this.programs = this.$storage.program.getters.getByIds(tableData.ids).map((t) => t.entity)
          .filter((t) => t.status === Status.Active || t.id === form.programId);
      }
    },
  },
});
</script>

<style scoped>
 .border-bottom {
   border-bottom: 1px solid var(--v-grey-lighten2);
 }
</style>
