<template>
  <v-container :class="{ container: true, enabled, 'border-radius-all': true }">
    <v-row>
      <v-col cols="10">
        <span class="rc-body18 fw-bold" :data-test="`feature-name-${feature.id}`">
          {{ feature.name }}
        </span>
      </v-col>
      <v-col cols="2">
        <v-switch
          v-model="enabled"
          class="mt-0 pt-0"
          hide-details
          :data-test="`feature-switch-${feature.id}`"
          :disabled="loading"
          :loading="loading"
          dense
          @change="onChange($event)" />
      </v-col>
    </v-row>
    <span class="rc-body12 description" :data-test="`feature-description-${feature.id}`">{{ $m(feature.description) }}</span>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { IFeatureEntity } from '@/entities/feature';

export default Vue.extend({
  name: 'FeatureWrapper',

  props: {
    feature: {
      type: Object as () => IFeatureEntity,
      required: true,
    },
  },

  data() {
    return {
      loading: false,
      enabled: this.feature.enabled,
    };
  },

  methods: {
    async onChange(newValue: boolean) {
      this.loading = true;
      this.$nextTick(async () => { // Use nextTick to be able to roll back swich button if api call fails
        const result = newValue
          ? await this.$storage.feature.actions.enableFeature(this.feature.id)
          : await this.$storage.feature.actions.disableFeature(this.feature.id);

        if (!result) {
          this.enabled = !newValue; // roll back
        }

        this.loading = false;
      });
    },
  },
});
</script>

<style scoped>
.container {
  border-style: solid;
  border-width: 1px;
  border-color: var(--v-grey-lighten3);
}
.enabled {
  background-color: #d9edf7;
}
::v-deep .v-input__slot {
  justify-content: right;
}
.description {
  color: var(--v-grey-darken2);
}
</style>
