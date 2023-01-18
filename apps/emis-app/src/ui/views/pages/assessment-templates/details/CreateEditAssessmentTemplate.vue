<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
    <page-template :loading="assessmentTemplateLoading" :show-left-menu="false">
      <rc-page-content
        :title="title">
        <assessment-template-form
          v-if="assessmentTemplate"
          :assessment-template.sync="assessmentTemplate"
          :is-edit-mode="isEditMode"
          :is-name-unique.sync="isNameUnique"
          :show-eligibility-criteria-warning.sync="showEligibilityCriteriaWarning" />

        <template slot="actions">
          <v-btn data-test="cancel" @click.stop="back()">
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn color="primary" data-test="save" :loading="loading" :disabled="failed || !dirty" @click.stop="submit">
            {{ submitLabel }}
          </v-btn>
        </template>
      </rc-page-content>
    </page-template>
  </validation-observer>
</template>

<script lang="ts">
/* eslint-disable max-depth */
import _cloneDeep from 'lodash/cloneDeep';
import { TranslateResult } from 'vue-i18n';
import { RcPageContent } from '@libs/component-lib/components';
import { VForm } from '@libs/shared-lib/types';
import { IAssessmentBaseEntity } from '@libs/entities-lib/assessment-template';
import helpers from '@/ui/helpers/helpers';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import mixins from 'vue-typed-mixins';
import handleUniqueNameSubmitError from '@/ui/mixins/handleUniqueNameSubmitError';
import { Route, NavigationGuardNext } from 'vue-router';
import AssessmentTemplateForm from './AssessmentTemplateForm.vue';
import assessmentDetail from './assessmentDetail';

export default mixins(handleUniqueNameSubmitError, assessmentDetail).extend({
  name: 'CreateEditAssessmentTemplate',

  components: {
    PageTemplate,
    RcPageContent,
    AssessmentTemplateForm,
  },

  props: {
    cloneId: {
      type: String,
      default: '',
    },
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    if (!this.dataSaved) {
      await helpers.confirmBeforeLeaving(this, (this.$refs.form as VForm).flags.dirty, next);
    } else {
      next();
    }
  },

  data() {
    return {
      loading: false,
      error: false,
      isNameUnique: true,
      dataSaved: false,
      showEligibilityCriteriaWarning: false,
    };
  },

  computed: {
    isEditMode(): boolean {
      return !this.cloneId && !!this.assessmentTemplateId;
    },

    title(): string {
      return (this.isEditMode ? this.$t('assessmentTemplate.edit.title') : this.$t('assessmentTemplate.add.title')) as string;
    },

    submitLabel(): TranslateResult {
      return this.isEditMode
        ? this.$t('common.save')
        : this.$t('common.buttons.create');
    },
  },

  async created() {
    if (this.cloneId) {
      this.assessmentTemplateId = this.cloneId;
    }
    await this.loadDetails();
    this.uniqueNameErrorCode = this.isFormMode
      ? 'errors.an-assessment-form-with-this-name-already-exists' : 'errors.an-assessment-template-with-this-name-already-exists';
  },

  methods: {
    back(): void {
      this.$router.replace({
        name: this.baseRoute.home.name,
      });
    },

    async submit() {
      this.assessmentTemplate.fillEmptyMultilingualAttributes();
      const isValid = await (this.$refs.form as VForm).validate();

      if (isValid) {
        let doSubmit = true;
        if (this.showEligibilityCriteriaWarning) {
          doSubmit = await this.$confirm({
            title: this.$t('assessmentForm.eligibilityCriteria.confirm.save.title'),
            messages: this.$t('assessmentForm.eligibilityCriteria.confirm.save.message'),
          });
        }

        if (doSubmit) {
          try {
            this.loading = true;
            let assessmentTemplate: IAssessmentBaseEntity;

            if (this.isFormMode) {
              if (this.isEditMode) {
                assessmentTemplate = await this.$storage.assessmentForm.actions.update(this.assessmentForm);
              } else {
                assessmentTemplate = await this.$storage.assessmentForm.actions.create(this.assessmentForm);
              }
            } else if (this.isEditMode) {
              assessmentTemplate = await this.$storage.assessmentTemplate.actions.update(this.assessmentTemplate);
            } else {
              assessmentTemplate = await this.$storage.assessmentTemplate.actions.create(this.assessmentTemplate);
            }
            if (assessmentTemplate) {
              if (this.cloneId) {
                assessmentTemplate = _cloneDeep(assessmentTemplate);
                assessmentTemplate.externalToolState = this.assessmentTemplate.externalToolState;
                assessmentTemplate.questions = this.assessmentTemplate.questions?.filter((x) => !x.endDate);
                assessmentTemplate = (this.isFormMode) ? await this.$storage.assessmentForm.actions.updateAssessmentStructure(assessmentTemplate)
                  : await this.$storage.assessmentTemplate.actions.updateAssessmentStructure(assessmentTemplate);
              }

              this.$toasted.global.success(this.$t(this.isEditMode ? 'assessmentTemplate.edit.success' : 'assessmentTemplate.create.success'));
              this.dataSaved = true;
              this.$router.replace({
                name: this.baseRoute.details.name,
                params: { assessmentTemplateId: assessmentTemplate.id },
              });
            }
          } catch (e) {
            this.$appInsights.trackTrace('AssessmentTemplate submit error', { error: e }, 'CreateEditAssessmentTemplate', 'submit');
            this.handleSubmitError(e);
          } finally {
            this.loading = false;
          }
        }
      } else {
        helpers.scrollToFirstError('scrollAnchor');
      }
    },
  },
});
</script>
