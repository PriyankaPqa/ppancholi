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
import { buildQuerySql } from '@libs/services-lib/odata-query-sql';
import { useMassActionStore } from '@/pinia/mass-action/mass-action';
import { IAssessmentFormEntity } from '@libs/entities-lib/assessment-template';
import { IMassActionAssessmentCreatePayload } from '@libs/services-lib/mass-actions/entity';
import { IMultilingual } from '@libs/shared-lib/types';
import utils from '@libs/entities-lib/utils';
import helpers from '@libs/shared-lib/helpers/helpers';
import AssessmentDetailsCreate from './AssessmentDetailsCreate.vue';

export interface AssessmentDetailsForm {
  event: IEventEntity,
  assessment: IAssessmentFormEntity,
  emailSubject: IMultilingual,
  emailTopCustomContent: IMultilingual,
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
        emailSubject: utils.initMultilingualAttributes(),
        emailTopCustomContent: utils.initMultilingualAttributes(),
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
      this.details.emailSubject = utils.getFilledMultilingualField(this.details.emailSubject);
      this.details.emailTopCustomContent = utils.getFilledMultilingualField(this.details.emailTopCustomContent);
      this.details.emailAdditionalDescription = utils.getFilledMultilingualField(this.details.emailAdditionalDescription);
    },

    /**
     * Triggered when creating a mass action from a filtered list
     */
    async onPost({ name, description }: { name: string; description: string }) {
      const searchParams = JSON.parse(this.$route.query.searchParams as string);

      const filter = buildQuerySql(helpers.removeInactiveItemsFilterOdata({ filter: searchParams.filter }) as any);

      this.fillEmptyMultilingualFields();

      const payload: IMassActionAssessmentCreatePayload = {
        name,
        description,
        eventId: this.details.event.id,
        assessmentFormId: this.details.assessment.id,
        emailSubject: this.details.emailSubject,
        emailTopCustomContent: this.details.emailTopCustomContent,
        emailAdditionalDescription: this.details.emailAdditionalDescription,
        search: null,
        filter,
      };

      this.loading = true;
      const entity = await useMassActionStore().create(MassActionType.Assessment, payload);
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
      this.formData.set('emailSubject', JSON.stringify(this.details.emailSubject.translation));
      this.formData.set('emailTopCustomContent', JSON.stringify(this.details.emailTopCustomContent.translation));
      this.formData.set('emailAdditionalDescription', JSON.stringify(this.details.emailAdditionalDescription.translation));

      this.loading = true;
      await (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
      this.loading = false;
    },
  },
});
</script>
