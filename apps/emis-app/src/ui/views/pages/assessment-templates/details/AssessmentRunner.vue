<template>
  <div class="pa-4">
    <!-- eslint-disable -->
    <div v-if="errorMessage" class="error-message" v-html="errorMessage"></div>
    <div id="surveyContainer">
      <Survey v-if="survey" :survey="survey" />
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
// Default V2 theme
import 'survey-core/defaultV2.min.css';

import mixins from 'vue-typed-mixins';
import _debounce from 'lodash/debounce';
import { CompletionStatus, IAssessmentResponseEntity } from '@libs/entities-lib/assessment-template';
import { cloneDeep } from 'lodash';
import { SurveyJsHelper, ISurveyModel } from '@libs/shared-lib/plugins/surveyJs/SurveyJsHelper';
import { NavigationGuardNext, Route } from 'vue-router';
import { useAssessmentResponseStore } from '@/pinia/assessment-response/assessment-response';
import helpers from '@/ui/helpers/helpers';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { UserRoles } from '@libs/entities-lib/user';
import assessmentDetail from './assessmentDetail';

const DEBOUNCE_RATE = 500;
const debouncedSave = _debounce((context) => {
  context._this.saveAnswers(context.sender);
}, DEBOUNCE_RATE);

export default mixins(assessmentDetail).extend({
  name: 'AssessmentRunner',
  props: {
    assessmentResponseId: {
      type: String,
      default: null,
    },
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    // Confirm navigating out when partial saving is not allowed and survey is not yet completed
    const condition = !this.assessmentTemplate.savePartialSurveyResults && !this.surveyCompleted;
    await helpers.confirmBeforeLeaving(this, condition, next);
  },

  beforeDestroy() {
    window.removeEventListener('beforeunload', this.beforeAssessmentRunnerWindowUnload);
  },

  data() {
    return {
      survey: null as ISurveyModel,
      surveyJsHelper: new SurveyJsHelper(),
      response: null as IAssessmentResponseEntity,
      errorMessage: null as string,
      surveyCompleted: false,
    };
  },

  async mounted() {
    if (this.assessmentResponseId) {
      this.response = cloneDeep((await useAssessmentResponseStore().fetch(
        { id: this.assessmentResponseId },
      )));
    }
    await this.loadDetails();
    this.errorMessage = this.assessmentResponseId
      ? this.surveyJsHelper.getSurveyCanBeCompletedErrorMessage(this.assessmentTemplate, this.response, this, this.$m, this.$hasLevel(UserRoles.level3)) : null;
    if (!this.errorMessage) {
      this.survey = this.surveyJsHelper.initializeSurveyJsRunner(
        this.$i18n.locale,
        this.assessmentTemplate.externalToolState?.data?.rawJson,
        this.response?.completionStatus === CompletionStatus.Completed,
      );

      if (this.response?.externalToolState?.data?.rawJson) {
        this.survey.data = JSON.parse(this.response.externalToolState.data.rawJson);
        if (this.survey.data._currentPageNo) {
          this.survey.currentPageNo = this.survey.data._currentPageNo;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const _this = this;
      if (this.assessmentTemplate.savePartialSurveyResults && this.response.completionStatus !== CompletionStatus.Completed) {
        this.survey.onValueChanged.add((sender: ISurveyModel) => debouncedSave({ _this, sender }));
      } else {
        // confirm leaving when navigating to another wbesite or closing the tab
        window.addEventListener('beforeunload', this.beforeAssessmentRunnerWindowUnload);
      }
      this.survey.onComplete.add(this.completeSurvey);
      this.surveyJsHelper.setColorScheme('#surveyContainer', useTenantSettingsStore().currentTenantSettings.branding.colours);
    }
  },

  methods: {
    async saveAnswers(sender: ISurveyModel) {
      this.response = cloneDeep(this.surveyJsHelper.surveyToAssessmentResponse(sender, cloneDeep(this.response)));
      if (this.assessmentResponseId) {
        const result = await useAssessmentResponseStore().saveAssessmentAnsweredQuestions(this.response);
        if (result) {
          this.response = result;
        }
      }
    },

    async completeSurvey(sender: ISurveyModel) {
      debouncedSave.cancel();
      await this.saveAnswers(sender);
      if (this.response.completionStatus !== CompletionStatus.Completed) {
        await this.$services.assessmentResponses.completeSurvey(this.response);
      }
      this.surveyCompleted = true;
    },

    beforeAssessmentRunnerWindowUnload(e : any) {
      if (!this.surveyCompleted) {
        e.preventDefault(); // prompt the user
        e.returnValue = ''; // prompt the user deprecated compatiblity with Chrome and Edge
      }
    },
  },
});
</script>

<style scoped>
#surveyContainer {
  display: flex;
  justify-content: center;
}

#surveyContainer :first-child {
  max-width: 1500px;
}
</style>
