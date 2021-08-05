<template>
  <mass-action-base-create
    :title="$t('massActions.importValidationStatus.create.title')"
    :url="url"
    :form-data="formData"
    @back="back()"
    @upload:start="prepareFormData()"
    @upload:success="onSuccess($event)">
    <template #form>
      <v-col cols="12" xl="8" lg="9" md="11" sm="12">
        <v-text-field-with-validation
          v-model="name"
          data-test="name"
          :label="`${$t('massActions.importValidationStatus.create.name.label')} *`"
          persistent-hint
          :rules="rules.name" />
        <v-text-area-with-validation
          v-model="description"
          data-test="description"
          :label="`${$t('massActions.importValidationStatus.create.description.label')}`"
          persistent-hint
          :rules="rules.description" />
      </v-col>
    </template>
  </mass-action-base-create>
</template>

<script lang="ts">
import { MAX_LENGTH_LG, MAX_LENGTH_MD } from '@/constants/validations';
import { VTextFieldWithValidation, VTextAreaWithValidation } from '@crctech/component-library';

import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import Vue from 'vue';
import { IMassActionEntity } from '@/entities/mass-action';

export default Vue.extend({
  name: 'ImportValidationStatusCreate',

  components: {
    MassActionBaseCreate,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
  },

  data() {
    return {
      name: '',
      description: '',
      showConfirmation: false,
      url: 'case-file/mass-actions/validate-impact-status',
      formData: new FormData(),
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        name: {
          required: true,
          max: MAX_LENGTH_MD,
        },
        description: {
          max: MAX_LENGTH_LG,
        },
      };
    },
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.importValidationStatus.home.name });
    },

    async prepareFormData() {
      this.formData.append('name', this.name);
      this.formData.append('description', this.description);
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
