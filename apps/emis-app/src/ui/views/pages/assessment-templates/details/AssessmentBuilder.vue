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
// import { SurveyJsHelper } from './SurveyJsHelper';
import { SurveyJsHelper, ISurveyCreator } from '@libs/shared-lib/plugins/surveyJs/SurveyJsHelper';
import { SurveyJsTextExtractor, IExtractedSurveyObject } from '@libs/shared-lib/plugins/surveyJs/SurveyJsTextExtractor';
import metadata from '@/ui/mixins/metadata';
import helpers from '@/ui/helpers/helpers';
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

    this.creator.saveSurveyFunc = this.saveSurveyJson;
    this.creator.onExtractSurvey.add(() => this.extract());

    if (this.assessmentTemplate.externalToolState?.data?.rawJson) {
      this.creator.text = this.assessmentTemplate.externalToolState?.data?.rawJson;
    } else {
      this.creator.text = this.getDefaultJson();
    }

    this.lastRawJsonSaved = this.creator.text;
    // confirm leaving when navigating to another wbesite or closing the tab
    window.addEventListener('beforeunload', this.beforeWindowUnload);

    if (!this.testMode) {
      this.creator.render('surveyCreator');
    }
    this.surveyJsHelper.setColorScheme('#surveyCreator', this.$storage.tenantSettings.getters.currentTenantSettings().branding.colours);
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

      if (this.isFormMode) {
        await this.$storage.assessmentForm.actions.updateAssessmentStructure(this.assessmentForm);
      } else {
        await this.$storage.assessmentTemplate.actions.updateAssessmentStructure(this.assessmentTemplate);
      }
      this.lastRawJsonSaved = this.assessmentTemplate.externalToolState?.data?.rawJson;
      callback(saveNo, true);
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
