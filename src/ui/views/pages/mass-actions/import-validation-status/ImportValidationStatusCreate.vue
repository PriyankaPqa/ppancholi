<template>
  <mass-action-base-create
    :title="$t('massActions.importValidationStatus.create.title')"
    :apply-to-label="$t('massActions.importValidationStatus.upload.title')"
    :url="url"
    :form-data="formData"
    @back="back()"
    @upload:success="onSuccess($event)" />
</template>

<script lang="ts">
import Vue from 'vue';

import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity } from '@/entities/mass-action';

export default Vue.extend({
  name: 'ImportValidationStatusCreate',

  components: {
    MassActionBaseCreate,
  },

  data() {
    return {
      showConfirmation: false,
      url: 'case-file/mass-actions/validate-impact-status',
      formData: new FormData(),
    };
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.importValidationStatus.home.name });
    },

    onSuccess(entity: IMassActionEntity) {
      this.$storage.massAction.mutations.setEntity(entity);
      this.goToDetail(entity.id);
    },

    goToDetail(id: string) {
      this.$router.push({ name: routes.massActions.importValidationStatus.details.name, params: { id } });
    },
  },
});
</script>
