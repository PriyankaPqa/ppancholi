<template>
  <div>
    <div id="surveyCreator" />
    <div id="extractedDataSection" style="display:none">
      <assessment-export
        v-if="extractedData"
        :extracted-data="extractedData" />
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */

import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.min.css';
import mixins from 'vue-typed-mixins';
import { SurveyJsHelper, ISurveyCreator } from '@libs/shared-lib/plugins/surveyJs/SurveyJsHelper';
import { SurveyJsTextExtractor, IExtractedSurveyObject } from '@libs/shared-lib/plugins/surveyJs/SurveyJsTextExtractor';
import metadata from '@/ui/mixins/metadata';
import helpers from '@/ui/helpers/helpers';
import { useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';
import { IAssessmentQuestion } from '@libs/entities-lib/assessment-template';
import { useAssessmentTemplateStore } from '@/pinia/assessment-template/assessment-template';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import assessmentDetail from './assessmentDetail';
import AssessmentExport from './AssessmentExport.vue';

export default mixins(assessmentDetail, metadata).extend({
  name: 'AssessmentBuilder',
  components: {
    AssessmentExport,
  },

  props: {
    // for automated tests - rendering surveyjs causes errors
    testMode: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      creator: null as ISurveyCreator,
      surveyJsHelper: new SurveyJsHelper((k: string) => this.$t(k) as string),
      extractedData: null as IExtractedSurveyObject,
      lastRawJsonSaved: null as string,
    };
  },

  computed: {
    metaTitle(): string {
      return this.$t('metaInfo.assessment_builder.title') as string;
    },
  },

  beforeDestroy() {
    window.removeEventListener('beforeunload', this.beforeWindowUnload);
  },

  async mounted() {
    await this.loadDetails();
    this.creator = this.surveyJsHelper.initializeSurveyJsCreator(this.$i18n.locale);

    if (this.assessmentForm) {
      if ((await this.$services.assessmentForms.assessmentTotalSubmissions(this.assessmentTemplateId)).totalAssigned) {
        if (await this.$confirm({
          title: this.$t('assessmentTemplate.assessmentInUse.title'),
          messages: this.$t('assessmentTemplate.assessmentInUse.message'),
          submitActionLabel: this.$t('assessmentTemplate.assessmentInUse.readonly'),
          cancelActionLabel: this.$t('assessmentTemplate.assessmentInUse.edit'),
        })) {
          this.creator.readOnly = true;
        }
      }
    }

    if (!this.creator.readOnly) {
      this.creator.saveSurveyFunc = this.saveSurveyJson;
      // confirm leaving when navigating to another wbesite or closing the tab
      window.addEventListener('beforeunload', this.beforeWindowUnload);
    }
    this.creator.onExtractSurvey.add(() => this.extract());

    if (this.assessmentTemplate.externalToolState?.data?.rawJson) {
      this.creator.text = this.assessmentTemplate.externalToolState?.data?.rawJson;
    } else {
      this.creator.text = this.getDefaultJson();
    }

    this.lastRawJsonSaved = this.creator.text;

    if (!this.testMode) {
      this.creator.render('surveyCreator');
    }
    this.surveyJsHelper.setColorScheme('#surveyCreator', useTenantSettingsStore().currentTenantSettings.branding.colours);
  },

  methods: {
    beforeWindowUnload(e : any) {
      if (this.lastRawJsonSaved !== this.creator.text) {
        e.preventDefault(); // prompt the user
        e.returnValue = ''; // prompt the user deprecated compatiblity with Chrome and Edge
      }
    },

    async saveSurveyJson(saveNo: any, callback: (saveNo: any, something: boolean) => void) {
      this.assessmentTemplate.externalToolState.data.rawJson = this.creator.text;
      this.assessmentTemplate.questions = this.surveyJsHelper.getAssessmentQuestions();

      if (!this.questionsAreValid(this.assessmentTemplate.questions)) {
        return;
      }

      if (this.isFormMode) {
        await useAssessmentFormStore().updateAssessmentStructure(this.assessmentForm);
      } else {
        await useAssessmentTemplateStore().updateAssessmentStructure(this.assessmentTemplate);
      }
      this.lastRawJsonSaved = this.assessmentTemplate.externalToolState?.data?.rawJson;
      callback(saveNo, true);
    },

    questionsAreValid(questions: IAssessmentQuestion[]): boolean {
      // normally each asnwer choice is unique - this is validate by surveyjs - but with the "other", "none" options which can be added they can
      // then have two "none"
      const duplicates = questions.map((q) => {
        const duplicateAnswers = q.answerChoices?.length ? q.answerChoices
            .filter((a) => q.answerChoices.find((a2) => a.identifier.toLowerCase() === a2.identifier.toLowerCase() && a !== a2)) : [];
        return { question: q, duplicateAnswers };
      }).filter((q) => q.duplicateAnswers.length);

      if (duplicates.length) {
        this.$confirm({
          title: this.$t('assessmentTemplate.duplicateAnswers.title'),
          htmlContent: this.$t(
            'assessmentTemplate.duplicateAnswers.message',
            { duplicates: duplicates.map((d) => `${d.question.identifier} - ${d.duplicateAnswers.map((a) => a.identifier).join(', ')}`).join('<br>') },
          ) as string,
          messages: null,
          showCancelButton: false,
          submitActionLabel: this.$t('common.cancel'),
        });
        return false;
      }
      return true;
    },

    getDefaultJson(): string {
      return `{
        "logo": {
          "default": "${this.$services.tenantSettings.getLogoUrl('en')}",
          "fr": "${this.$services.tenantSettings.getLogoUrl('fr')}"
        },
        "logoPosition": "right",
         "clearInvisibleValues": "onHiddenContainer"
        }`;
    },

    async extract(): Promise<void> {
      const isFrench = await this.$confirm({
        title: this.$t('assessmentTemplate.extract.pickLanguage.title'),
        messages: this.$t('assessmentTemplate.extract.pickLanguage.message'),
        submitActionLabel: this.$t('tab.fr'),
        cancelActionLabel: this.$t('tab.en'),
      });
      // binds the data to extractedDataSection - you can make that section visible when debugging / adding features for easy development
      this.extractedData = new SurveyJsTextExtractor(isFrench ? 'fr' : 'en').extractAllText(this.creator.survey.toJSON());
      // we'll give ample time for all the html to render correctly on slower machines then send the html to the BE
      // this is still a really fast export!
      await helpers.timeout(2000);
      this.$services.assessmentForms.htmlToWord(
`<html>${document.getElementById('extractedDataSection').innerHTML}</html>`,
        `${this.extractedData.title || 'assessment'}.docx`,
);
    },
  },
});
</script>

<style scoped>
#surveyCreator {
  height: 99vh;
}

::v-deep .svd-simulator-main {
  display: flex;
  justify-content: center;
}

::v-deep .svc-creator__content-holder {
  background-color: white;
}

::v-deep .svd-simulator-content {
  max-width: 1500px;
}
</style>
