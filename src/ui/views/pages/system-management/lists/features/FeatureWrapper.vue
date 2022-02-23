<template>
  <div class="py-3">
    <v-row class="flex-1 align-center">
      <v-col cols="10">
        <div class="rc-body14 fw-bold mb-1" :data-test="`feature-name-${feature.id}`">
          {{ $m(feature.name) }}
        </div>
      </v-col>
      <v-col cols="2">
        <v-row class="flex-1 justify-end pr-2">
          <v-switch
            v-model="enabled"
            class="mt-0 pt-0"
            hide-details
            :data-test="`feature-switch-${feature.id}`"
            :disabled="loading"
            :loading="loading"
            dense
            @change="onChange($event)" />
        </v-row>
      </v-col>
    </v-row>
    <v-col cols="10">
      <v-row class="rc-body12 text-justify" :data-test="`feature-description-${feature.id}`">
        {{ $m(feature.description) }}
      </v-row>
    </v-col>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IFeatureEntity } from '@/entities/tenantSettings';

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
          ? await this.$storage.tenantSettings.actions.enableFeature(this.feature.id)
          : await this.$storage.tenantSettings.actions.disableFeature(this.feature.id);

        if (!result) {
          this.enabled = !newValue; // roll back
        }

        this.loading = false;
      });
    },
  },
});
</script>
