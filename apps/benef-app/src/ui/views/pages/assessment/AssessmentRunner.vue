<template>
  <div class="pa-4">
    <div class="survey-header-row mx-auto d-flex flex-row-reverse">
      <language-selector data-test="registration-portal-language-selector" />
    </div>
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

import Vue from 'vue';
import _debounce from 'lodash/debounce';
import { AssessmentFormEntity, IAssessmentResponseEntity } from '@libs/entities-lib/assessment-template';
import { cloneDeep } from 'lodash';
import { SurveyJsHelper, ISurveyModel } from '@libs/shared-lib/plugins/surveyJs/SurveyJsHelper';
import { httpClient } from '@/services/httpClient';
import helpers from '@/ui/helpers';
import LanguageSelector from '@/ui/views/components/shared/LanguageSelector.vue';

const DEBOUNCE_RATE = 500;
const debouncedSave = _debounce((context) => {
  context._this.saveAnswers(context.sender);
}, DEBOUNCE_RATE);

export default Vue.extend({
  name: 'AssessmentRunner',

  components: {
    LanguageSelector,
  },
  props: {
    assessmentResponseId: {
      type: String,
      required: true,
    },
    assessmentTemplateId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      survey: null as ISurveyModel,
      surveyJsHelper: new SurveyJsHelper(),
      response: null as IAssessmentResponseEntity,
      assessmentTemplate: null as AssessmentFormEntity,
      errorMessage: null as string,
      surveyCompleted: false,
    };
  },

  watch: {
    $route() {
      // to rebind language
      this.initializeSurvey();
    },
  },

  beforeDestroy() {
    window.removeEventListener('beforeunload', this.beforeAssessmentRunnerWindowUnload);
  },

  async mounted() {
    await this.initializeTenant();
    await this.initializeSurvey();
  },

  methods: {
    async saveAnswers(sender: ISurveyModel) {
      this.response = cloneDeep(this.surveyJsHelper.surveyToAssessmentResponse(sender, this.response));
      if (this.assessmentResponseId) {
        const result = await this.$services.assessmentResponses.saveAssessmentAnsweredQuestions(this.response);
        if (result) {
          this.response = result;
        }
      }
    },

    async completeSurvey(sender: ISurveyModel) {
      debouncedSave.cancel();
      await this.saveAnswers(sender);
      await this.$services.assessmentResponses.completeSurveyByBeneficiary(this.response);
      this.surveyCompleted = true;
    },

    beforeAssessmentRunnerWindowUnload(e : any) {
      if (!this.surveyCompleted) {
        e.preventDefault(); // prompt the user
        e.returnValue = ''; // prompt the user deprecated compatiblity with Chrome and Edge
      }
    },

    async initializeSurvey() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias,@typescript-eslint/naming-convention
      const _this = this;
      await this.loadDetails();
      this.errorMessage = this.surveyJsHelper.getSurveyCanBeCompletedErrorMessage(this.assessmentTemplate, this.response, this, this.$m);
      if (!this.errorMessage) {
        this.survey = this.surveyJsHelper.initializeSurveyJsRunner(this.$i18n.locale, this.assessmentTemplate.externalToolState.data.rawJson);
        this.survey.render('surveyContainer');

        if (this.response?.externalToolState?.data?.rawJson) {
          this.survey.data = JSON.parse(this.response.externalToolState.data.rawJson);
          if (this.survey.data._currentPageNo) {
            this.survey.currentPageNo = this.survey.data._currentPageNo;
          }
        }
        if (this.assessmentTemplate.savePartialSurveyResults) {
          this.survey.onValueChanged.add((sender: ISurveyModel) => debouncedSave({ _this, sender }));
        }
        this.survey.onComplete.add(this.completeSurvey);
        this.surveyJsHelper.setColorScheme('#surveyContainer', this.$storage.tenantSettings.getters.currentTenantSettings().branding.colours);

        if (!this.assessmentTemplate.savePartialSurveyResults) {
          // confirm leaving when navigating to another wbesite or closing the tab
          window.addEventListener('beforeunload', this.beforeAssessmentRunnerWindowUnload);
        }
      }
    },

    async initializeTenant() {
      const currentdomain = helpers.getCurrentDomain(this.$route);

      const tenantId = await this.$services.publicApi.getTenantByRegistrationDomain(currentdomain);
      httpClient.setHeadersTenant(tenantId);

      await this.$storage.tenantSettings.actions.fetchBranding();
    },

    async loadDetails() {
      try {
        this.response = cloneDeep((await this.$services.assessmentResponses.getForBeneficiary(this.assessmentResponseId)));
        const res = await this.$services.assessmentForms.getForBeneficiary(this.assessmentTemplateId);
        const form = new AssessmentFormEntity(res);

        this.assessmentTemplate = form;
      } catch {
        // forms are not available
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

#surveyContainer :first-child, .survey-header-row {
  max-width: 1500px;
}

.error-message {
  padding: 20px;
}
</style>
