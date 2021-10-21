<template>
  <mass-action-base-create
    ref="base"
    :title="$t('massActions.importValidationStatus.create.title')"
    :apply-to-label="$t('massActions.importValidationStatus.upload.title')"
    :upload-url="uploadUrl"
    :mode="MassActionMode.File"
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
  name: 'ImportValidationStatusCreate',

  components: {
    MassActionBaseCreate,
  },

  data() {
    return {
      showConfirmation: false,
      uploadUrl: 'case-file/mass-actions/validate-impact-status',
      formData: new FormData(),
      MassActionMode,
    };
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.importValidationStatus.home.name });
    },

    onSuccess(entity: IMassActionEntity) {
      this.goToDetail(entity.id);
    },

    goToDetail(id: string) {
      this.$router.push({ name: routes.massActions.importValidationStatus.details.name, params: { id } });
    },

    onUploadStart() {
      (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
    },
  },
});
</script>
