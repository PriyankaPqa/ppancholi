<template>
  <rc-page-content :title="$t('system_management.card.features.title')" :outer-scroll="true" :full-height="true">
    <v-row justify="center" class="mt-8">
      <v-col cols="10" lg="8">
        <div class="rc-body18 fw-bold mb-4">
          {{ $t('system_management.features.temporaryFeatures') }}
        </div>
        <feature-table data-test="temporary-features" class="mt-4" :features="temporaryFeatures" />
      </v-col>
    </v-row>

    <v-row justify="center" class="my-8">
      <v-col cols="10" lg="8">
        <div class="rc-body18 fw-bold mb-4">
          {{ $t('system_management.features.permanentFeatures') }}
        </div>
        <feature-table data-test="permanent-features" class="mt-4" :features="permanentFeatures" />
      </v-col>
    </v-row>

    <template slot="actions">
      <v-btn color="primary" data-test="branding-back-btn" @click="back()">
        {{ $t('common.button.back') }}
      </v-btn>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent } from '@crctech/component-library';
import FeatureTable from './FeatureTable.vue';
import routes from '@/constants/routes';
import { FeatureType, IFeatureEntity } from '@/entities/tenantSettings';

export default Vue.extend({
  name: 'Features',

  components: {
    RcPageContent,
    FeatureTable,
  },

  computed: {
    temporaryFeatures(): IFeatureEntity[] {
      return this.$storage.tenantSettings.getters.currentTenantSettings().features.filter((f) => f.type === FeatureType.Temporary);
    },
    permanentFeatures(): IFeatureEntity[] {
      return this.$storage.tenantSettings.getters.currentTenantSettings().features.filter((f) => f.type === FeatureType.Permanent);
    },
  },

  methods: {
    back() {
      this.$router.replace({
        name: routes.systemManagement.home.name,
      });
    },
  },
});
</script>
