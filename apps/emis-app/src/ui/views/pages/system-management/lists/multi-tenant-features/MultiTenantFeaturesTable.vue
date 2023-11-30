<template>
  <v-simple-table>
    <template #default>
      <thead>
        <tr>
          <th @click="sort('name')">
            {{ $t('system_management.features.feature') }}
            <v-icon size="16px">
              {{ nameSortingIcon }}
            </v-icon>
          </th>
          <th v-if="showAgeColumn" class="text-center" @click="sort('age')">
            {{ $t('system_management.features.age') }}
            <v-icon size="16px">
              {{ ageSortingIcon }}
            </v-icon>
          </th>
          <th v-for="tenant in tenants" :key="tenant.id" class="text-center">
            {{ $m(tenant.branding.name) }}
          </th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="feature in filteredFeatures" :key="feature.key">
          <td>
            <div>{{ feature.name }}</div>
            <div class="rc-body12 fw-bold">
              {{ feature.key }}
            </div>
          </td>
          <td v-if="showAgeColumn" class="border-left text-center">
            {{ feature.age }}
          </td>
          <td v-for="tenant in tenants" :key="tenant.id" class="border-left">
            <div v-if="feature.tenantMap.get(tenant.id)" class="d-flex flex-row justify-center">
              <v-tooltip left>
                <template #activator="{ on }">
                  <div :data-test="`feature-enabled-${feature.tenantMap.get(tenant.id).id}-${tenant.id}`" v-on="on">
                    <span v-if="feature.tenantMap.get(tenant.id).enabled" class="on text-no-wrap white--text">
                      {{ $t('system_management.features.on') }}
                    </span>
                    <span v-else class="off text-no-wrap white--text">
                      {{ $t('system_management.features.off') }}
                    </span>
                  </div>
                </template>
                <div>canEnable: {{ feature.tenantMap.get(tenant.id).canEnable }}</div>
                <div>canDisable: {{ feature.tenantMap.get(tenant.id).canDisable }}</div>
              </v-tooltip>

              <v-btn
                v-if="feature.tenantMap.get(tenant.id).enabled"
                :data-test="`feature-disable-btn-${feature.tenantMap.get(tenant.id).id}-${tenant.id}`"
                x-small
                :disabled="!feature.tenantMap.get(tenant.id).canDisable"
                @click="toggleEnabled(false, tenant, feature)">
                {{ $t('common.turn_off') }}
              </v-btn>

              <v-btn
                v-if="!feature.tenantMap.get(tenant.id).enabled"
                :data-test="`feature-enable-btn-${feature.tenantMap.get(tenant.id).id}-${tenant.id}`"
                x-small
                :disabled="!feature.tenantMap.get(tenant.id).canEnable"
                @click="toggleEnabled(true, tenant, feature)">
                {{ $t('common.turn_on') }}
              </v-btn>

              <v-btn icon :data-test="`feature-table-edit-btn-${feature.key}-${tenant.id}`" @click="editFeature(tenant, feature)">
                <v-icon>
                  mdi-pencil
                </v-icon>
              </v-btn>
            </div>
          </td>
          <td class="border-left">
            <v-tooltip left :open-on-hover="!canDeleteFeature(feature)">
              <template #activator="{ on }">
                <div class="d-inline-block" v-on="on">
                  <v-btn
                    icon
                    class="mr-2"
                    :disabled="!canDeleteFeature(feature)"
                    data-test="delete"
                    @click="deleteFeature(feature)">
                    <v-icon size="24" color="grey darken-2">
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </div>
              </template>
              <div v-for="tenantFeature in feature.tenantMap.values()" :key="tenantFeature.id">
                <span v-if="tenantFeature.enabled">
                  {{ getTenantName(tenantFeature) }}:
                  {{ $t('system_management.features.on') }}</span>
              </div>
            </v-tooltip>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td class="fw-medium">
            {{ countText }}
          </td>
          <td v-if="showAgeColumn" />
          <td :colspan="tenants.length" />
          <td />
        </tr>
      </tfoot>
    </template>
  </v-simple-table>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import _orderBy from 'lodash/orderBy';
import { ITenantSettingsEntity, IFeatureEntity, FeatureType } from '@libs/entities-lib/tenantSettings';
import helpers from '@libs/shared-lib/helpers/helpers';

interface IFeatureView {
  key: string,
  name: string,
  age: string,
  type: FeatureType,
  tenantMap: Map<string, IFeatureEntity>,
}

export default Vue.extend({
  name: 'MultiTenantFeaturesTable',

  props: {
    features: {
      type: Array as () => IFeatureView[],
      required: true,
    },
    tenants: {
      type: Array as () => ITenantSettingsEntity[],
      required: true,
    },
    searchText: {
      type: String,
      required: true,
    },
    showAgeColumn: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      sortBy: ['name', 'age'],
      sortOrders: ['asc', 'desc'],
      nameAscendingSort: true,
      ageAscendingSort: false,
      selectedFeature: null,
      selectedTenant: null,
      selectedToEnable: false,
    };
  },

  computed: {
    filteredFeatures(): IFeatureView[] {
      const filtered = !this.searchText
        ? this.features
        : this.features.filter((f: IFeatureView) => {
            const name = helpers.getNormalizedString(f.name).toLowerCase();
            return name.indexOf(this.searchText.toLowerCase()) > -1;
          });
      return _orderBy(filtered, this.sortBy, this.sortOrders);
    },
    nameSortingIcon(): string {
      return this.nameAscendingSort
        ? 'arrow_upward'
        : 'arrow_downward';
    },
    ageSortingIcon(): string {
      return this.ageAscendingSort
        ? 'arrow_upward'
        : 'arrow_downward';
    },
    countText() : TranslateResult {
      return this.$t(
        'system_management.features.count',
        {
          count: this.filteredFeatures.length,
          all: this.features.length,
        },
      );
    },
    headers(): Record<string, unknown> [] {
      const values = [
        {
          text: 'Feature',
          value: 'name',
          sortable: true,
        },
        {
          text: 'Age',
          value: 'age',
          sortable: false,
        },
      ];
      this.tenants.forEach((tenant) => {
        values.push({
          text: this.$m(tenant.branding.name),
          value: tenant.id,
          sortable: false,
        });
      });
      return values;
    },
  },

  methods: {
    sort(column: string) {
      if (column === 'name') {
        this.nameAscendingSort = !this.nameAscendingSort;
        this.sortBy = ['name', 'age'];
        this.sortOrders = [this.getOrder(this.nameAscendingSort), this.getOrder(this.ageAscendingSort)];
      }
      if (column === 'age') {
        this.ageAscendingSort = !this.ageAscendingSort;
        this.sortBy = ['age', 'name'];
        this.sortOrders = [this.getOrder(this.ageAscendingSort), this.getOrder(this.nameAscendingSort)];
      }
    },
    getOrder(isAscending: boolean): string {
      return isAscending ? 'asc' : 'desc';
    },
    toggleEnabled(isEnabled: boolean, tenant: ITenantSettingsEntity, feature: IFeatureView) {
      this.$emit('toggleEnabled', {
        isEnabled,
        feature,
        tenant,
      });
    },
    editFeature(tenant: ITenantSettingsEntity, feature: IFeatureView) {
      this.$emit('editFeature', {
        feature,
        tenant,
      });
    },
    canDeleteFeature(feature: IFeatureView): Boolean {
      for (const tenantFeature of feature.tenantMap.values()) {
        if (tenantFeature.enabled) {
          return false;
        }
      }
      return true;
    },
    deleteFeature(feature: IFeatureView) {
      this.$emit('deleteFeature', {
        feature,
        tenant: null,
      });
    },
    getTenantName(feature: IFeatureEntity): String {
      return this.$m(this.tenants.find((tf) => tf.id === feature.tenantId)?.branding.name);
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
