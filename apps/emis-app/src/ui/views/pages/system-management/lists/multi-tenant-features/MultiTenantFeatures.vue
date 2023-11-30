<template>
  <rc-page-content
    :title="$t('system_management.features.title', { count: featureArray.length })"
    :show-search="true"
    :outer-scroll="true"
    :loading="loading"
    :full-height="true"
    @search="searchString = $event">
    <div class="rc-body18 fw-bold">
      {{ $t('system_management.features.temporaryFeatures') }}
    </div>
    <multi-tenant-features-table
      :features="temporaryFeatures"
      :tenants="allTenants"
      :search-text.sync="searchString"
      @toggleEnabled="onToggleEnabled"
      @editFeature="onEditFeature"
      @deleteFeature="onDeleteFeature" />

    <div class="rc-body18 fw-bold mt-4">
      {{ $t('system_management.features.permanentFeatures') }}
    </div>
    <multi-tenant-features-table
      :features="permanentFeatures"
      :tenants="allTenants"
      :search-text.sync="searchString"
      :show-age-column="false"
      @toggleEnabled="onToggleEnabled"
      @editFeature="onEditFeature"
      @deleteFeature="onDeleteFeature" />

    <template slot="actions">
      <v-btn color="primary" data-test="features-back-btn" @click="back()">
        {{ $t('common.button.back') }}
      </v-btn>
      <v-btn color="primary" data-test="features-add-btn" @click="addFeature()">
        {{ $t('common.add') }}
      </v-btn>
    </template>

    <rc-confirmation-dialog
      v-if="showEnableConfirmationDialog"
      :loading="loading"
      data-test="feature-set-enabled-confirmation-dialog"
      :show.sync="showEnableConfirmationDialog"
      :title="confirmationDialogText.title"
      :messages="confirmationDialogText.message"
      @submit="setEnabled()"
      @cancel="showEnableConfirmationDialog = false"
      @close="showEnableConfirmationDialog = false" />

    <rc-confirmation-dialog
      v-if="showDeleteConfirmationDialog"
      :loading="loading"
      data-test="feature-delete-confirmation-dialog"
      :show.sync="showDeleteConfirmationDialog"
      :title="confirmationDialogText.title"
      :messages="confirmationDialogText.message"
      @submit="deleteFeature()"
      @cancel="showDeleteConfirmationDialog = false"
      @close="showDeleteConfirmationDialog = false" />
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent, RcConfirmationDialog } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import { ITenantSettingsEntity, IFeatureEntity, IRemoveFeatureRequest, FeatureType } from '@libs/entities-lib/tenantSettings';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import MultiTenantFeaturesTable from './MultiTenantFeaturesTable.vue';

interface IFeatureView {
  key: string,
  name: string,
  age: string,
  type: FeatureType,
  tenantMap: Map<string, IFeatureEntity>,
}

interface IFeatureEvent {
  feature: IFeatureView,
  tenant: ITenantSettingsEntity,
}

interface IEnableEvent extends IFeatureEvent {
  isEnabled: boolean,
}

export default Vue.extend({
  name: 'MultiTenantFeatures',

  components: {
    RcPageContent,
    RcConfirmationDialog,
    MultiTenantFeaturesTable,
  },

  data() {
    return {
      loading: true,
      searchString: '',
      showEnableConfirmationDialog: false,
      showDeleteConfirmationDialog: false,
      selectedFeature: null,
      selectedTenant: null,
      selectedToEnable: false,
    };
  },

  computed: {
    allTenants(): ITenantSettingsEntity[] {
      return useTenantSettingsStore().getAll();
    },
    allFeatures(): Map<string, Map<string, IFeatureEntity>> {
      const features = new Map<string, Map<string, IFeatureEntity>>();
      this.allTenants.forEach((tenant: ITenantSettingsEntity) => {
        tenant.features.forEach((tenantFeature: IFeatureEntity) => {
          let featureMap = features.get(tenantFeature.key);
          if (!featureMap) {
            featureMap = new Map<string, IFeatureEntity>();
            features.set(tenantFeature.key, featureMap);
          }
          featureMap.set(tenant.id, tenantFeature);
        });
      });

      return features;
    },
    featureArray(): IFeatureView[] {
      const features = [] as IFeatureView[];
      this.allFeatures.forEach((v: Map<string, IFeatureEntity>, k) => {
        const firstFeature = v.values().next().value as IFeatureEntity;
        const f = { key: k, name: this.$m(firstFeature.name), age: this.getAge(firstFeature.created), type: firstFeature.type, tenantMap: v };
        features.push(f);
      });
      return features;
    },
    temporaryFeatures(): IFeatureView[] {
      return this.featureArray.filter((f: IFeatureView) => f.type === FeatureType.Temporary);
    },
    permanentFeatures(): IFeatureView[] {
      return this.featureArray.filter((f: IFeatureView) => f.type === FeatureType.Permanent);
    },
    confirmationDialogText() : { title:string, message:string } {
      const text = {
        title: this.selectedFeature.name,
        message: '',
      };
      if (this.showDeleteConfirmationDialog) {
        text.message = this.$t('system_management.features.deleteFeature.confirm') as string;
      } else if (this.showEnableConfirmationDialog) {
        if (this.selectedToEnable) {
          text.message = this.$t('system_management.features.enableFeature.confirm') as string;
        } else {
          text.message = this.$t('system_management.features.disableFeature.confirm') as string;
        }
      }
      return text;
    },
  },

  async created() {
    try {
      await useTenantSettingsStore().fetchAllTenantSettings();
    } finally {
      this.loading = false;
    }
  },

  methods: {
    getAge(created: Date | string): number {
      const today = new Date();
      const createdDate = new Date(created);
      return Math.round(Math.abs((today.getTime() - createdDate.getTime()) / (24 * 60 * 60 * 1000)));
    },
    onToggleEnabled(event: IEnableEvent) {
      this.selectedFeature = event.feature;
      this.selectedTenant = event.tenant;
      this.selectedToEnable = event.isEnabled;
      this.showEnableConfirmationDialog = true;
    },
    async setEnabled() {
      if (!this.selectedFeature || !this.selectedTenant) {
        return;
      }
      await useTenantSettingsStore().setFeatureEnabled(this.selectedToEnable, this.selectedFeature.key, this.selectedTenant.id);
      this.showEnableConfirmationDialog = false;
    },
    onEditFeature(event: IFeatureEvent) {
      const tenantFeature = event.feature.tenantMap.get(event.tenant.id);
      this.$router.push({
        name: routes.systemManagement.multiTenantFeatures.edit.name,
        params: {
          featureId: tenantFeature.id,
          tenantId: event.tenant.id,
        },
      });
    },
    onDeleteFeature(event: IFeatureEvent) {
      this.selectedFeature = event.feature;
      this.showDeleteConfirmationDialog = true;
    },
    async deleteFeature() {
      if (!this.selectedFeature) {
        return;
      }
      let allTenantIds: string[] = [];
      for (const tenantId of this.selectedFeature.tenantMap.keys()) {
        allTenantIds = [...allTenantIds, tenantId];
      }
      const payload: IRemoveFeatureRequest = {
        key: this.selectedFeature.key,
        tenantIds: allTenantIds,
      };
      await useTenantSettingsStore().removeFeature(payload);
      this.showDeleteConfirmationDialog = false;
    },
    addFeature() {
      this.$router.push({
        name: routes.systemManagement.multiTenantFeatures.create.name,
      });
    },
    back() {
      this.$router.replace({
        name: routes.systemManagement.home.name,
      });
    },
  },
});
</script>

<style scoped lang="scss">

.on {
  padding: 4px;
  background: green;
  margin-right: 10px;
  text-transform: uppercase;
  font-weight: 500;
}

.off {
  padding: 4px;
  background: red;
  margin-right: 10px;
  text-transform: uppercase;
  font-weight: 500;
}

  .border-left {
    border-left: thin solid rgba(0, 0, 0, 0.12);
  }

</style>
