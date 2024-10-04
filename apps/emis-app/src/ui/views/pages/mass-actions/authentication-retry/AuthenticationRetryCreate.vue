<template>
  <mass-action-base-create
    ref="base"
    :title="$t('massActions.authenticationRetry.create.title')"
    :apply-to-label="$t('massActions.authenticationRetry.upload.title')"
    :upload-url="uploadUrl"
    :allowed-extensions="['xlsx']"
    :mode="$route.query.mode"
    :form-data="formData"
    :loading="loading"
    @back="back()"
    @upload:start="onUploadStart()"
    @upload:success="onSuccess($event)"
    @post="onPost($event)">
    <template #form>
      <authentication-retry-details-create :form="details" @update="onUpdate($event)" />
    </template>
  </mass-action-base-create>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity, MassActionType, AuthenticationTier } from '@libs/entities-lib/mass-action';
import { IEventEntity } from '@libs/entities-lib/event';
import { IMassActionAuthenticationRetryCreatePayload } from '@libs/services-lib/mass-actions/entity';
import { useMassActionStore } from '@/pinia/mass-action/mass-action';
import { buildQuerySql } from '@libs/services-lib/odata-query-sql';
import helpers from '@libs/shared-lib/helpers/helpers';
import AuthenticationRetryDetailsCreate from './AuthenticationRetryDetailsCreate.vue';

export interface AuthenticationRetryDetailsForm {
  event: IEventEntity,
  tier: AuthenticationTier,
}

export default Vue.extend({
  name: 'AuthenticationRetryCreate',

  components: {
    MassActionBaseCreate,
    AuthenticationRetryDetailsCreate,
  },

  data() {
    return {
      showConfirmation: false,
      formData: new FormData(),
      uploadUrl: 'case-file/mass-actions/authentication-retry',
      details: {
        event: null,
        tier: null,
      } as AuthenticationRetryDetailsForm,
      loading: false,
    };
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.authenticationRetry.home.name });
    },

    onSuccess(entity: IMassActionEntity) {
      this.goToDetail(entity.id);
    },

    goToDetail(id: string) {
      this.$router.push({ name: routes.massActions.authenticationRetry.details.name, params: { id } });
    },

    onUpdate(form: AuthenticationRetryDetailsForm) {
      this.details = form;
    },

    /**
     * Triggered when creating a mass action from a filtered list
     */
    async onPost({ name, description }: { name: string; description: string }) {
      const searchParams = JSON.parse(this.$route.query.searchParams as string);
      helpers.convertDateStringToDateObject(searchParams);
      const filter = buildQuerySql(helpers.removeInactiveItemsFilterOdata({ filter: searchParams.filter }) as any);

      const payload: IMassActionAuthenticationRetryCreatePayload = {
        name,
        description,
        eventId: this.details.event.id,
        tier: this.details.tier,
        search: null,
        filter,
      };

      this.loading = true;
      const entity = await useMassActionStore().create(MassActionType.AuthenticationRetry, payload);
      this.loading = false;

      if (entity) {
        this.onSuccess(entity);
      }
    },
    /**
     * Triggered when creating a mass action from a file
     */
    async onUploadStart() {
      this.formData.set('eventId', this.details.event.id);
      this.formData.set('tier', this.details.tier.toString());
      this.loading = true;
      await (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
      this.loading = false;
    },
  },
});
</script>
