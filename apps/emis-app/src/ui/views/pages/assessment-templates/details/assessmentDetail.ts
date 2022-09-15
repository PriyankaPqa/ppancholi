import Vue from 'vue';
import {
  AssessmentBaseEntity, AssessmentTemplateEntity, AssessmentFormEntity, IAssessmentFormEntity, PublishStatus, AssessmentFrequencyType, IAssessmentFormMetadata,
} from '@libs/entities-lib/assessment-template';
import { Status } from '@libs/entities-lib/base';
import routes from '@/constants/routes';
import { IProgramEntity } from '@libs/entities-lib/program';
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

    assessmentFormMetadata(): IAssessmentFormMetadata {
      return this.assessmentTemplate?.id ? this.$storage.assessmentForm.getters.get(this.assessmentTemplate.id)?.metadata : null;
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
        const res = this.assessmentTemplateId ? await this.$storage.assessmentForm.actions.fetch(
          { id: this.assessmentTemplateId }, { useEntityGlobalHandler: true, useMetadataGlobalHandler: false },
        ) : null;
        const form = new AssessmentFormEntity(res?.entity);

        form.eventId = this.id;

        this.assessmentTemplate = form;

        if (form.programId) {
          this.program = (await this.$storage.program.actions.fetch({ id: form.programId, eventId: form.eventId }))?.entity;
        }
      } else {
        const res = this.assessmentTemplateId ? await this.$storage.assessmentTemplate.actions.fetch(
          { id: this.assessmentTemplateId }, { useEntityGlobalHandler: true, useMetadataGlobalHandler: false },
        ) : null;
        this.assessmentTemplate = new AssessmentTemplateEntity(res?.entity);
      }
      this.assessmentTemplateLoading = false;
    },
  },
});
