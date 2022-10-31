<template>
  <div id="surveyCreator" />
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */

import { SurveyCreator } from 'survey-creator-knockout';
import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.min.css';
import mixins from 'vue-typed-mixins';
// import { SurveyJsHelper } from './SurveyJsHelper';
import { SurveyJsHelper } from '@libs/shared-lib/plugins/surveyJs/SurveyJsHelper';
import metadata from '@/ui/mixins/metadata';
import assessmentDetail from './assessmentDetail';

export default mixins(assessmentDetail, metadata).extend({
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

  computed: {
    metaTitle(): string {
      return this.$t('metaInfo.assessment_builder.title') as string;
    },
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
    this.surveyJsHelper.setColorScheme('#surveyCreator', this.$storage.tenantSettings.getters.currentTenantSettings().branding.colours);
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
        "logoPosition": "right",
         "clearInvisibleValues": "onHiddenContainer"
        }`;
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
