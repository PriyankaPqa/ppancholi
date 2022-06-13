<template>
  <mass-action-base-create
    ref="base"
    hide-name
    :title="$t('massActions.dataCorrection.create.title')"
    :apply-to-label="$t('massActions.dataCorrection.upload.title')"
    :upload-url="uploadUrl"
    :mode="MassActionMode.File"
    :form-data="formData"
    :loading="loading"
    @back="back()"
    @upload:start="onUploadStart()"
    @upload:success="onSuccess($event)">
    <template #top>
      <v-autocomplete-with-validation
        v-model="selectedType"
        :items="massActionTypes"
        :rules="{required: true}"
        item-value="value"
        data-test="massActionType"
        :label="`${$t('massActions.dataCorrection.type.label')} *`" />
    </template>
  </mass-action-base-create>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity, MassActionDataCorrectionType, MassActionMode } from '@/entities/mass-action';
import { VAutocompleteWithValidation } from '@libs/component-lib/components';
import helpers from '@/ui/helpers/helpers';
import { format } from 'date-fns';

export default Vue.extend({
  name: 'DataCorrectionCreate',

  components: {
    MassActionBaseCreate,
    VAutocompleteWithValidation,
  },

  data() {
    return {
      showConfirmation: false,
      formData: new FormData(),
      uploadUrl: 'case-file/mass-actions/data-correction',
      loading: false,
      selectedType: null,
      MassActionMode,
      MassActionDataCorrectionType,
    };
  },
  computed: {
    massActionTypes() {
      return helpers.enumToTranslatedCollection(MassActionDataCorrectionType, 'enums.MassActionDataCorrectionType', false);
    },
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.dataCorrection.home.name });
    },

    onSuccess(entity: IMassActionEntity) {
      this.goToDetail(entity.id);
    },

    goToDetail(id: string) {
      this.$router.push({ name: routes.massActions.dataCorrection.details.name, params: { id } });
    },

    generateName() {
      const date = format(new Date(), 'yyyyMMdd HHmmss');
      const name = this.$t(`enums.MassActionDataCorrectionType.${MassActionDataCorrectionType[this.selectedType]}`);
      return `${name} - ${date}`;
    },

    /**
     * Triggered when creating a mass action from a file
     */
    async onUploadStart() {
      this.formData.set('name', this.generateName());
      this.formData.set('massActionType', this.selectedType);
      this.loading = true;
      await (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
      this.loading = false;
    },
  },
});
</script>
