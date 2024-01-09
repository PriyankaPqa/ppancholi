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
      <communication-details-create :form="details" @update="onUpdate($event)" />
    </template>
  </mass-action-base-create>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity, MassActionType, MassActionCommunicationMethod } from '@libs/entities-lib/mass-action';
import { IEventEntity } from '@libs/entities-lib/event';
import { buildQuery } from '@libs/services-lib/odata-query';
import { useMassActionStore } from '@/pinia/mass-action/mass-action';
import { IMassActionCommunicationCreatePayload } from '@libs/services-lib/mass-actions/entity';
import { IMultilingual } from '@libs/shared-lib/types';
import utils from '@libs/entities-lib/utils';
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
        method: null,
        messageSubject: utils.initMultilingualAttributes(),
        emailMessage: utils.initMultilingualAttributes(),
        smsMessage: utils.initMultilingualAttributes(),
      } as CommunicationDetailsForm,
      loading: false,
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

    /**
     * Triggered when creating a mass action from a filtered list
     */
    async onPost({ name, description }: { name: string; description: string }) {
      const azureSearchParams = JSON.parse(this.$route.query.azureSearchParams as string);

      const filter = buildQuery({ filter: azureSearchParams.filter }).replace('?$filter=', '');

      this.fillEmptyMultilingualFields();

      const payload: IMassActionCommunicationCreatePayload = {
        name,
        description,
        eventId: this.details.event.id,
        method: this.details.method,
        messageSubject: this.details.messageSubject,
        message: this.details.method === MassActionCommunicationMethod.Email ? this.details.emailMessage : this.details.smsMessage,
        search: azureSearchParams.search,
        filter: `${filter} and Entity/Status eq 1`,
      };

      this.loading = true;
      const entity = await useMassActionStore().create(MassActionType.Communications, payload);
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
      this.formData.set('method', this.details.method.toString());
      this.formData.set('messageSubject', JSON.stringify(this.details.messageSubject.translation));
      this.formData.set('message', JSON.stringify(this.details.method === MassActionCommunicationMethod.Email ? this.details.emailMessage : this.details.smsMessage));

      this.loading = true;
      await (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
      this.loading = false;
    },
  },
});
</script>
