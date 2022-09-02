<template>
  <div id="surveyCreator" />
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */

import { SurveyCreator } from 'survey-creator-knockout';
import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.min.css';
import 'survey-core/survey.i18n';
import 'survey-creator-core/survey-creator-core.i18n';
import mixins from 'vue-typed-mixins';
import { SurveyJsHelper } from './SurveyJsHelper';
import assessmentDetail from './assessmentDetail';

export default mixins(assessmentDetail).extend({
  name: 'AssessmentBuilder',

  props: {
    // for automated tests - rendering surveyjs causes errors
    testMode: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      creator: null as SurveyCreator,
      surveyJsHelper: new SurveyJsHelper(),
    };
  },

  async mounted() {
    await this.loadDetails();
    this.creator = this.surveyJsHelper.initializeSurveyJsCreator(this.$i18n.locale);

    this.creator.saveSurveyFunc = this.saveSurveyJson;

    if (this.assessmentTemplate.externalToolState?.data?.rawJson) {
      this.creator.text = this.assessmentTemplate.externalToolState?.data?.rawJson;
    } else {
      this.creator.text = this.getDefaultJson();
    }
    if (!this.testMode) {
      this.creator.render('surveyCreator');
    }
  },

  methods: {
    async saveSurveyJson(saveNo: any, callback: (saveNo: any, something: boolean) => void) {
      this.assessmentTemplate.externalToolState.data.rawJson = this.creator.text;
      this.assessmentTemplate.questions = this.surveyJsHelper.getAssessmentQuestions();

      if (this.isFormMode) {
        await this.$storage.assessmentForm.actions.updateAssessmentStructure(this.assessmentForm);
      } else {
        await this.$storage.assessmentTemplate.actions.updateAssessmentStructure(this.assessmentTemplate);
      }
      callback(saveNo, true);
    },

    getDefaultJson(): string {
      return `{
        "logo": {
          "default": "${this.$services.tenantSettings.getLogoUrl('en')}",
          "fr": "${this.$services.tenantSettings.getLogoUrl('fr')}"
        },
        "logoPosition": "right"
        }`;
    },
  },
});
</script>

<style scoped>
#surveyCreator {
  height: 99vh;
}
</style>
