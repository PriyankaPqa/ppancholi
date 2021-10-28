<template>
  <mass-action-base-create
    ref="base"
    :title="$t('massActions.importPaymentStatus.create.title')"
    :apply-to-label="$t('massActions.importPaymentStatus.upload.title')"
    :mode="MassActionMode.File"
    :upload-url="url"
    :form-data="formData"
    @back="back()"
    @upload:start="onUploadStart()"
    @upload:success="onSuccess($event)" />
</template>

<script lang="ts">
import Vue from 'vue';

import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity, MassActionMode } from '@/entities/mass-action';

export default Vue.extend({
  name: 'ImportPaymentStatusCreate',

  components: {
    MassActionBaseCreate,
  },

  data() {
    return {
      showConfirmation: false,
      url: 'case-file/mass-actions/import-payment-status',
      formData: new FormData(),
      MassActionMode,
    };
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.importPaymentStatus.home.name });
    },

    onSuccess(entity: IMassActionEntity) {
      this.goToDetail(entity.id);
    },

    goToDetail(id: string) {
      this.$router.push({ name: routes.massActions.importPaymentStatus.details.name, params: { id } });
    },

    onUploadStart() {
      (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
    },
  },
});
</script>
