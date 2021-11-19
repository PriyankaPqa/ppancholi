<template>
  <rc-page-content :title="$t('system_management.card.features.title')" :outer-scroll="true" :full-height="true">
    <v-row justify="center" class="mt-8">
      <v-col cols="10" lg="8">
        <feature-wrapper v-for="feature in features" :key="feature.id" :feature="feature" />
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
import FeatureWrapper from './FeatureWrapper.vue';
import routes from '@/constants/routes';
import { IFeatureEntity } from '@/entities/feature';

export default Vue.extend({
  name: 'Features',

  components: {
    RcPageContent,
    FeatureWrapper,
  },

  computed: {
    features(): IFeatureEntity[] {
      return this.$storage.feature.getters.getAll().map((f) => f.entity);
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
