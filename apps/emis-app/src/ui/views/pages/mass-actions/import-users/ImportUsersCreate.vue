<template>
  <mass-action-base-create
    ref="base"
    :title="$t('massActions.importUsers.create.title')"
    :apply-to-label="$t('massActions.importUsers.upload.title')"
    :mode="MassActionMode.File"
    :upload-url="url"
    :form-data="formData"
    :run-type="MassActionRunType.PreProcess"
    :loading="loading"
    @back="back()"
    @upload:start="onUploadStart()"
    @upload:success="onSuccess($event)" />
</template>

<script lang="ts">
import Vue from 'vue';

import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity, MassActionMode, MassActionRunType } from '@/entities/mass-action';

export default Vue.extend({
  name: 'ImportUsersCreate',

  components: {
    MassActionBaseCreate,
  },

  data() {
    return {
      showConfirmation: false,
      url: 'case-file/mass-actions/import-users',
      formData: new FormData(),
      MassActionMode,
      MassActionRunType,
      loading: false,
    };
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.importUsers.home.name });
    },

    onSuccess(entity: IMassActionEntity) {
      this.goToDetail(entity.id);
    },

    goToDetail(id: string) {
      this.$router.push({ name: routes.massActions.importUsers.details.name, params: { id } });
    },

    async onUploadStart() {
      this.loading = true;
      await (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
      this.loading = false;
    },
  },
});
</script>
