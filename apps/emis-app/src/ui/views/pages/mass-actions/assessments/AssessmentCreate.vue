<template>
  <mass-action-base-create
    ref="base"
    :title="$t('massActions.assessment.create.title')"
    :apply-to-label="$t('massActions.assessment.upload.title')"
    :upload-url="uploadUrl"
    :mode="$route.query.mode"
    :form-data="formData"
    :loading="loading"
    @back="back()"
    @upload:start="onUploadStart()"
    @upload:success="onSuccess($event)"
    @post="onPost($event)">
    <template #form>
      <assessment-details-create :form="details" @update="onUpdate($event)" />
    </template>
  </mass-action-base-create>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity, MassActionType } from '@libs/entities-lib/mass-action';
import { IEventEntity } from '@libs/entities-lib/event';
import { buildQuery } from '@libs/services-lib/odata-query';
import { useMassActionStore } from '@/pinia/mass-action/mass-action';
import { IAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
import { IMassActionAssessmentCreatePayload } from '@libs/services-lib/mass-actions/entity';
import { IMultilingual } from '@libs/shared-lib/types';
import utils from '@libs/entities-lib/utils';
import AssessmentDetailsCreate from './AssessmentDetailsCreate.vue';

export interface AssessmentDetailsForm {
  event: IEventEntity,
  assessment: IAssessmentFormEntity,
  emailAdditionalDescription: IMultilingual,
}

export default Vue.extend({
  name: 'AssessmentCreate',

  components: {
    MassActionBaseCreate,
    AssessmentDetailsCreate,
  },

  data() {
    return {
      showConfirmation: false,
      formData: new FormData(),
      uploadUrl: 'case-file/mass-actions/assessment',
      details: {
        event: null,
        assessment: null,
        emailAdditionalDescription: utils.initMultilingualAttributes(),
      } as AssessmentDetailsForm,
      loading: false,
    };
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.assessments.home.name });
    },

    onSuccess(entity: IMassActionEntity) {
      this.goToDetail(entity.id);
    },

    goToDetail(id: string) {
      this.$router.push({ name: routes.massActions.assessments.details.name, params: { id } });
    },

    onUpdate(form: AssessmentDetailsForm) {
      this.details = form;
    },

    fillEmptyMultilingualFields() {
      this.details.emailAdditionalDescription = utils.getFilledMultilingualField(this.details.emailAdditionalDescription);
    },

    /**
     * Triggered when creating a mass action from a filtered list
     */
    async onPost({ name, description }: { name: string; description: string }) {
      const azureSearchParams = JSON.parse(this.$route.query.azureSearchParams as string);

      const filter = buildQuery({ filter: azureSearchParams.filter }).replace('?$filter=', '');

      this.fillEmptyMultilingualFields();

      const payload: IMassActionAssessmentCreatePayload = {
        name,
        description,
        eventId: this.details.event.id,
        assessmentFormId: this.details.assessment.id,
        emailAdditionalDescription: this.details.emailAdditionalDescription,
        search: azureSearchParams.search,
        filter: `${filter} and Entity/Status eq 1`,
      };

      this.loading = true;
      const entity = await useMassActionStore().create(MassActionType.Assessments, payload);
      this.loading = false;

      if (entity) {
        this.onSuccess(entity);
      }
    },
    /**
     * Triggered when creating a mass action from a file
     */
    async onUploadStart() {
      this.fillEmptyMultilingualFields();

      this.formData.set('eventId', this.details.event.id);
      this.formData.set('assessmentFormId', this.details.assessment.id);
      this.formData.set('emailAdditionalDescription', JSON.stringify(this.details.emailAdditionalDescription.translation));

      this.loading = true;
      await (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
      this.loading = false;
    },
  },
});
</script>
