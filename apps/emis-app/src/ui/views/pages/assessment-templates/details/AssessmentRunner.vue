<template>
  <div class="pa-4" style="max-width: 1000px">
    <div id="surveyContainer" />
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
// Default V2 theme
import 'survey-core/defaultV2.min.css';

import mixins from 'vue-typed-mixins';
import { SurveyModel } from 'survey-core';
import { IAssessmentResponseEntity } from '@libs/entities-lib/assessment-template';
import { cloneDeep } from 'lodash';
import { SurveyJsHelper } from './SurveyJsHelper';
import assessmentDetail from './assessmentDetail';

export default mixins(assessmentDetail).extend({
  name: 'AssessmentRunner',
  props: {
    assessmentResponseId: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      survey: null as SurveyModel,
      surveyJsHelper: new SurveyJsHelper(),
      response: null as IAssessmentResponseEntity,
    };
  },

  async mounted() {
    if (this.assessmentResponseId) {
      this.response = cloneDeep((await this.$storage.assessmentResponse.actions.fetch({ id: this.assessmentResponseId },
        { useEntityGlobalHandler: true, useMetadataGlobalHandler: false }))?.entity);
    }
    await this.loadDetails();
    this.survey = this.surveyJsHelper.initializeSurveyJsRunner(this.$i18n.locale, this.assessmentTemplate.externalToolState?.data?.rawJson);
    this.survey.render('surveyContainer');

    if (this.response?.externalToolState?.data?.rawJson) {
      this.survey.data = JSON.parse(this.response.externalToolState.data.rawJson);
    }
    this.survey.onValueChanged.add(this.saveAnswers);
  },

  methods: {
    async saveAnswers(sender: SurveyModel) {
      this.response = cloneDeep(this.surveyJsHelper.surveyToAssessmentResponse(sender, this.response));
      if (this.assessmentResponseId) {
        this.response = await this.$storage.assessmentResponse.actions.saveAssessmentAnsweredQuestions(this.response);
      }
    },
  },
});
</script>
