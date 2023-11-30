<template>
  <validation-observer ref="form" v-slot="{ failed, dirty }" slim>
    <page-template :loading="loading" :show-left-menu="false">
      <rc-page-content
        :title="isEditMode ? $t('system_management.features.edit') : $t('system_management.features.create')">
        <feature-form :feature.sync="feature" :is-edit-mode="isEditMode" :is-dirty.sync="isDirty" />
        <template slot="actions">
          <v-btn data-test="cancel" @click.stop="back()">
            {{ $t('common.cancel') }}
          </v-btn>

          <v-btn color="primary" data-test="save" :loading="loading" :disabled="failed || loading || (isEditMode && !dirty)" @click.stop="submit">
            {{ submitLabel }}
          </v-btn>
        </template>
      </rc-page-content>
    </page-template>
  </validation-observer>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcPageContent } from '@libs/component-lib/components';
import { VForm } from '@libs/shared-lib/types';
import { ITenantSettingsEntity, FeatureEntity, ICreateFeatureRequest, IEditFeatureRequest } from '@libs/entities-lib/tenantSettings';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';
import entityUtils from '@libs/entities-lib/utils';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import FeatureForm from './FeatureForm.vue';

export default Vue.extend({
  name: 'CreateEditDocument',

  components: {
    PageTemplate,
    RcPageContent,
    FeatureForm,
  },

  props: {
    featureId: {
      type: String,
      default: '',
    },
    tenantId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      loading: false,
      error: false,
      feature: new FeatureEntity(null),
      isDirty: false,
    };
  },

  computed: {
    isEditMode(): boolean {
      return this.$route.name === routes.systemManagement.multiTenantFeatures.edit.name;
    },

    submitLabel(): TranslateResult {
      return this.isEditMode
        ? this.$t('common.save')
        : this.$t('common.buttons.add');
    },
  },

  async created() {
    if (this.featureId?.length > 0) {
      const tenantSettings = useTenantSettingsStore().getById(this.tenantId) as ITenantSettingsEntity;
      this.feature = tenantSettings.features.find((f) => f.id === this.featureId);
    } else {
      this.feature = new FeatureEntity(null);
    }
  },

  methods: {
    back(): void {
      this.$router.back();
    },

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (isValid && (this.isEditMode)) {
        const payload: IEditFeatureRequest = {
          ...this.feature,
        };
        await useTenantSettingsStore().editFeature(payload);
        this.$toasted.global.success(this.$t('system_management.features.featureUpdated'));
        this.back();
      } else if (isValid) {
        // ensure multilingual fields have valid data
        this.feature.name = entityUtils.getFilledMultilingualField(this.feature.name);
        this.feature.description = entityUtils.getFilledMultilingualField(this.feature.description);
        // create for all tenants
        const allTenantIds = useTenantSettingsStore().getAll().map((ts) => ts.id);
        const payload: ICreateFeatureRequest = {
          ...this.feature,
          tenantIds: allTenantIds,
        };
        await useTenantSettingsStore().createFeature(payload);
        this.$toasted.global.success(this.$t('system_management.features.featureCreated'));
        this.back();
      } else {
        helpers.scrollToFirstError('scrollAnchor');
      }
    },
  },
});
</script>
