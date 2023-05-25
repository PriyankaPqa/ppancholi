<template>
  <mass-action-base-create
    ref="base"
    :title="$t('massActions.financialAssistance.create.title')"
    :apply-to-label="$t('massActions.financialAssistance.upload.title')"
    :mode="MassActionMode.File"
    :upload-url="url"
    :allowed-extensions="['xlsx']"
    :form-data="formData"
    :loading="loading"
    @back="back()"
    @upload:start="onUploadStart()"
    @upload:success="onSuccess($event)">
    <template #form>
      <events-selector
        v-model="selectedEvent"
        async-mode
        :force-events="filteredEvents"
        return-object
        data-test="payment_event_name"
        fetch-all-events
        :label="`${$t('massActions.financialAssistance.create.event.label')} *`"
        :rules="{ required: true }" />
    </template>
  </mass-action-base-create>
</template>

<script lang="ts">
import Vue from 'vue';

import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity, MassActionMode } from '@libs/entities-lib/mass-action';
import { IEventEntity } from '@libs/entities-lib/event';
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';

export default Vue.extend({
  name: 'FinancialAssistanceCustomCreate',

  components: {
    MassActionBaseCreate,
    EventsSelector,
  },

  data() {
    return {
      showConfirmation: false,
      url: 'case-file/mass-actions/financial-assistance-custom-options',
      formData: new FormData(),
      MassActionMode,
      loading: false,
      filteredEvents: [],
      selectedEvent: null as IEventEntity,
    };
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.financialAssistanceCustom.home.name });
    },

    onSuccess(entity: IMassActionEntity) {
      this.goToDetail(entity.id);
    },

    goToDetail(id: string) {
      this.$router.push({ name: routes.massActions.financialAssistanceCustom.details.name, params: { id } });
    },

    async onUploadStart() {
      this.formData.set('eventId', this.selectedEvent.id);
      this.loading = true;
      await (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
      this.loading = false;
    },
  },
});
</script>
