<template>
  <mass-action-base-create
    ref="base"
    :title="$t('massActions.communication.create.title')"
    :apply-to-label="$t('massActions.communication.upload.title')"
    :upload-url="uploadUrl"
    :mode="$route.query.mode"
    :form-data="formData"
    :loading="loading"
    @back="back()"
    @upload:start="onUploadStart()"
    @upload:success="onSuccess($event)"
    @post="onPost($event)">
    <template #form>
      <communication-details-create :form="details" @update="onUpdate($event)" @addfile="onAddfile($event)" />
    </template>
  </mass-action-base-create>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity, MassActionEntity, MassActionCommunicationMethod } from '@libs/entities-lib/mass-action';
import { IEventEntity } from '@libs/entities-lib/event';
import { IMultilingual } from '@libs/shared-lib/types';
import utils from '@libs/entities-lib/utils';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { buildQuerySql } from '@libs/services-lib/odata-query-sql';
import CommunicationDetailsCreate from './CommunicationDetailsCreate.vue';

export interface CommunicationDetailsForm {
  event: IEventEntity,
  method: MassActionCommunicationMethod,
  messageSubject: IMultilingual,
  emailMessage: IMultilingual,
  smsMessage: IMultilingual,
}

export default Vue.extend({
  name: 'CommunicationCreate',

  components: {
    MassActionBaseCreate,
    CommunicationDetailsCreate,
  },

  data() {
    return {
      showConfirmation: false,
      formData: new FormData(),
      uploadUrl: 'case-file/mass-actions/communication',
      details: {
        event: null,
        method: MassActionCommunicationMethod.Email,
        messageSubject: utils.initMultilingualAttributes(),
        emailMessage: utils.initMultilingualAttributes(),
        smsMessage: utils.initMultilingualAttributes(),
      } as CommunicationDetailsForm,
      loading: false,
      files: [],
    };
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.communications.home.name });
    },

    onSuccess(entity: IMassActionEntity) {
      this.goToDetail(entity.id);
    },

    goToDetail(id: string) {
      this.$router.push({ name: routes.massActions.communications.details.name, params: { id } });
    },

    onUpdate(form: CommunicationDetailsForm) {
      this.details = form;
    },

    fillEmptyMultilingualFields() {
      this.details.messageSubject = utils.getFilledMultilingualField(this.details.messageSubject);
      this.details.emailMessage = utils.getFilledMultilingualField(this.details.emailMessage);
      this.details.smsMessage = utils.getFilledMultilingualField(this.details.smsMessage);
    },

    onAddfile(file: []) {
      this.files = file;
    },

    /**
     * Triggered when creating a mass action from a filtered list
     */
    async onPost({ name, description }: { name: string; description: string }) {
      const azureSearchParams = JSON.parse(this.$route.query.azureSearchParams as string);

      const filter = buildQuerySql(CombinedStoreFactory.RemoveInactiveItemsFilterOdata({ filter: azureSearchParams.filter }, true) as any);

      this.fillEmptyMultilingualFields();
      this.formData.set('name', name);
      this.formData.set('description', description);
      this.formData.set('search', azureSearchParams.search);
      this.formData.set('eventId', this.details.event.id);
      this.formData.set('method', this.details.method.toString());
      this.formData.set('messageSubject', JSON.stringify(this.details.messageSubject.translation));

      this.formData.set('message', this.details.method === MassActionCommunicationMethod.Email
        ? JSON.stringify(this.details.emailMessage.translation) : JSON.stringify(this.details.smsMessage.translation));
      this.formData.delete('attachments');
      for (const file of this.files) {
        this.formData.append('attachments', file);
      }

      this.loading = true;
      const base = this.$refs.base as InstanceType<typeof MassActionBaseCreate>;
      await base.uploadForm(this.formData, `case-file/mass-actions/communication-from-listV2${filter}`);
      if (base.uploadSuccess) {
        const entity = new MassActionEntity(base.response.data as IMassActionEntity);
        if (entity) {
            this.onSuccess(entity);
        }
      }
      this.loading = false;
    },
    /**
     * Triggered when creating a mass action from a file
     */
    async onUploadStart() {
      this.fillEmptyMultilingualFields();
      this.formData.set('eventId', this.details.event.id);
      this.formData.set('method', this.details.method.toString());
      this.formData.set('messageSubject', JSON.stringify(this.details.messageSubject.translation));

      this.formData.set('message', this.details.method === MassActionCommunicationMethod.Email
        ? JSON.stringify(this.details.emailMessage.translation) : JSON.stringify(this.details.smsMessage.translation));
      this.formData.delete('attachments');
      for (const file of this.files) {
        this.formData.append('attachments', file);
      }
      this.loading = true;
      await (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
      this.loading = false;
    },
  },
});
</script>
