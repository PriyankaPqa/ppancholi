<template>
  <div>
    <feature-wrapper v-for="feature in features" :key="feature.id" class="list-row" :feature="feature" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IFeatureEntity } from '@/entities/tenantSettings';
import FeatureWrapper from './FeatureWrapper.vue';

export default Vue.extend({
  name: 'FeatureTable',

  components: {
    FeatureWrapper,
  },

  props: {
    features: {
      type: Array as () => IFeatureEntity[],
      required: true,
    },
  },
});
</script>
