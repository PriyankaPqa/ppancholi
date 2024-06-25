<template>
  <mass-action-base-create
    ref="base"
    :title="$t('massAction.caseFileStatus.create.title')"
    :apply-to-label="$t('massAction.caseFileStatus.upload.title')"
    :upload-url="uploadUrl"
    :mode="$route.query.mode"
    :form-data="formData"
    :loading="loading"
    @back="back()"
    @upload:start="onUploadStart()"
    @upload:success="onSuccess($event)"
    @post="onPost($event)">
    <template #form>
      <case-file-status-mass-action-create-details :form.sync="form" />
    </template>
  </mass-action-base-create>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity, MassActionType } from '@libs/entities-lib/mass-action';
import { IEventEntity } from '@libs/entities-lib/event';
import { IListOption } from '@libs/shared-lib/types';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { buildQuerySql } from '@libs/services-lib/odata-query-sql';
import { IMassActionCaseFileStatusCreatePayload } from '@libs/services-lib/mass-actions/entity';
import { useMassActionStore } from '@/pinia/mass-action/mass-action';
import helpers from '@libs/shared-lib/helpers/helpers';
import CaseFileStatusMassActionCreateDetails from './CaseFileStatusMassActionCreateDetails.vue';

export interface MassActionCaseFileStatusForm {
  event?: IEventEntity,
  status?: CaseFileStatus,
  reason?: IListOption,
  rationale?: string,
}

export default Vue.extend({
  name: 'CaseFileStatusMassActionCreate',

  components: {
    MassActionBaseCreate,
    CaseFileStatusMassActionCreateDetails,
  },

  data() {
    return {
      formData: new FormData(),
      uploadUrl: 'case-file/mass-actions/case-file-status',
      loading: false,
      form: {
        event: null,
        status: null,
        reason: { optionItemId: null, specifiedOther: null },
        rationale: null,
      } as MassActionCaseFileStatusForm,
    };
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.caseFileStatus.home.name });
    },

    onSuccess(entity: IMassActionEntity) {
      this.$router.push({ name: routes.massActions.caseFileStatus.details.name, params: { id: entity.id } });
    },

    /**
     * Triggered when creating a mass action from a filtered list
     */
    async onPost({ name, description }: { name: string, description: string }) {
      const searchParams = JSON.parse(this.$route.query.searchParams as string);
      helpers.convertDateStringToDateObject(searchParams);
      const filter = buildQuerySql(helpers.removeInactiveItemsFilterOdata({ filter: searchParams.filter }) as any);
      const { reason, rationale, status } = this.form;

      const payload = {
        name,
        description,
        eventId: this.form.event?.id,
        reason: reason.optionItemId ? reason : null,
        rationale,
        status,
        search: null,
        filter,
      } as IMassActionCaseFileStatusCreatePayload;

      this.loading = true;
      const entity = await useMassActionStore().create(MassActionType.CaseFileStatus, payload);
      this.loading = false;

      if (entity) {
        this.onSuccess(entity);
      }
    },
    /**
     * Triggered when creating a mass action from a file
     */
    async onUploadStart() {
      const { reason, rationale, status } = this.form;

      this.formData.set('eventId', this.form.event?.id || '');
      this.formData.set('reason', reason && reason.optionItemId ? JSON.stringify(reason) : '');
      this.formData.set('rationale', rationale || '');
      this.formData.set('status', status?.toString() || '');

      this.loading = true;
      await (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
      this.loading = false;
    },
  },
});
</script>
