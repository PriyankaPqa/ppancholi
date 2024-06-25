import Vue from 'vue';
import {
  AssessmentBaseEntity, AssessmentTemplateEntity, AssessmentFormEntity, IAssessmentFormEntity, PublishStatus, AssessmentFrequencyType,
} from '@libs/entities-lib/assessment-template';
import { Status } from '@libs/shared-lib/types';
import routes from '@/constants/routes';
import { IProgramEntity } from '@libs/entities-lib/program';
import { useAssessmentFormStore } from '@/pinia/assessment-form/assessment-form';
import { useAssessmentTemplateStore } from '@/pinia/assessment-template/assessment-template';
import { useProgramStore } from '@/pinia/program/program';
import { IAssessmentBaseRoute } from '../IAssessmentBaseRoute.type';

export default Vue.extend({
  props: {
    id: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      assessmentTemplateId: this.$route.params.assessmentTemplateId,
      assessmentTemplateLoading: true,
      assessmentTemplate: null as AssessmentBaseEntity,
      program: null as IProgramEntity,
      Status,
      PublishStatus,
      Frequency: AssessmentFrequencyType,
    };
  },

  computed: {
    isFormMode() : boolean {
      return !!this.id;
    },

    eventId(): string {
      return this.id;
    },

    assessmentForm(): IAssessmentFormEntity {
      return this.isFormMode ? this.assessmentTemplate as AssessmentFormEntity : null;
    },

    baseRoute() : IAssessmentBaseRoute {
      return this.isFormMode ? routes.events.assessments : routes.assessmentTemplates;
    },
  },

  methods: {
    async loadDetails() {
      this.assessmentTemplateLoading = true;
      this.program = null;
      if (this.isFormMode) {
        // eslint-disable-next-line max-len,vue/max-len
        const res = this.assessmentTemplateId ? await useAssessmentFormStore().fetch({ id: this.assessmentTemplateId }) : null;
        const form = new AssessmentFormEntity(res);

        form.eventId = this.id;

        this.assessmentTemplate = form;

        if (form.programId) {
          this.program = await useProgramStore().fetch({ id: form.programId, eventId: form.eventId });
        }
      } else {
        // eslint-disable-next-line max-len,vue/max-len
        const res = this.assessmentTemplateId ? await useAssessmentTemplateStore().fetch({ id: this.assessmentTemplateId }) : null;
        this.assessmentTemplate = new AssessmentTemplateEntity(res);
      }

      this.assessmentTemplateLoading = false;
    },
  },
});
