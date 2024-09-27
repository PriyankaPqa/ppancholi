<template>
  <rc-dialog
    :title="title"
    :cancel-action-label="$t('common.button.back')"
    data-test="assessment-template-preview-dialog"
    :show.sync="show"
    content-padding="5"
    content-only-scrolling
    scroll-anchor-id="templateSchrollAnchor"
    :persistent="true"
    :tooltip-label="$t('common.tooltip_label')"
    :show-submit="false"
    cancel-button-class="preview-cancel-button"
    fullscreen
    @cancel="close"
    @close="close">
    <div class="content">
      <rc-page-loading v-if="assessmentTemplateLoading" />
      <v-row v-else>
        <v-col cols="12" class="pa-4">
          <div id="surveyContainer">
            <Survey v-if="survey" :survey="survey" />
          </div>
        </v-col>
      </v-row>
    </div>
  </rc-dialog>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
// Default V2 theme
import 'survey-core/defaultV2.min.css';

import Vue from 'vue';
import { RcDialog, RcPageLoading } from '@libs/component-lib/components';
import { SurveyJsHelper, ISurveyModel } from '@libs/shared-lib/plugins/surveyJs/SurveyJsHelper';
import {
  AssessmentBaseEntity, AssessmentFormEntity, IAssessmentFormEntity,
} from '@libs/entities-lib/assessment-template';
import { IProgramEntity } from '@libs/entities-lib/program';
import { useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';
import { useProgramStore } from '@/pinia/program/program';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';

export default Vue.extend({
  name: 'AssessmentTemplatePreview',

  components: {
    RcDialog,
    RcPageLoading,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    languageMode: {
      type: String,
      default: '',
    },
    eventId: {
      type: String,
      default: '',
    },
    assessment: {
      type: Object as () => IAssessmentFormEntity,
      default: null as IAssessmentFormEntity,
    },
  },

  data() {
    return {
      survey: null as ISurveyModel,
      surveyJsHelper: new SurveyJsHelper(),
      assessmentTemplateLoading: true,
      assessmentTemplate: null as AssessmentBaseEntity,
      program: null as IProgramEntity,
    };
  },

  watch: {
    assessment: {
      async handler(newAssessment) {
        if (newAssessment) {
          await this.loadSurvey();
        }
      },
    },
    languageMode: {
      async handler(newLanguageMode) {
        if (newLanguageMode) {
          this.initialize();
        }
      },
    },
  },

  async mounted() {
    await this.loadSurvey();
      setTimeout(() => {
           document.getElementById('templateSchrollAnchor').scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  },

  methods: {
    close() {
      this.$emit('update:show', false);
      this.initialize();
    },

    initialize() {
      this.survey = this.surveyJsHelper.initializeSurveyJsRunner(
        this.languageMode,
        this.assessmentTemplate.externalToolState?.data?.rawJson,
      );
      this.surveyJsHelper.setColorScheme('#surveyContainer', useTenantSettingsStore().currentTenantSettings.branding.colours);
    },

    async loadSurvey() {
      await this.loadDetails();
      this.initialize();
    },

    async loadDetails() {
      this.assessmentTemplateLoading = true;
      this.program = null;
      // eslint-disable-next-line max-len,vue/max-len
      const res = this.assessment?.id ? await useAssessmentFormStore().fetch({ id: this.assessment?.id }) : null;
      const form = new AssessmentFormEntity(res);
      form.eventId = this.eventId;
      this.assessmentTemplate = form;
      if (form.programId) {
        this.program = await useProgramStore().fetch({ id: form.programId, eventId: form.eventId });
      }
      this.assessmentTemplateLoading = false;
    },

  },
});

</script>
<style lang="scss" scoped>

  #surveyContainer {
    display: flex;
    justify-content: center;
  }

  #surveyContainer :first-child {
    max-width: 1500px;
  }
</style>
