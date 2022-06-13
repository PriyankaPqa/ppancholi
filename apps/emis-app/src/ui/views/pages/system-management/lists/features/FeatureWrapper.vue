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
          <rc-tooltip v-if="shouldLock" bottom>
            <template #activator="{ on }">
              <v-icon class="mr-4" v-on="on">
                mdi-lock
              </v-icon>
            </template>
            <span>{{ enabled ? $t('system_management.features.cannotBeDisabled') : $t('system_management.features.cannotBeEnabled') }}</span>
          </rc-tooltip>
          <v-switch
            v-model="enabled"
            class="mt-0 pt-0"
            hide-details
            :data-test="`feature-switch-${feature.id}`"
            :disabled="loading || shouldLock"
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
import { RcTooltip } from '@libs/component-lib/components';

export default Vue.extend({
  name: 'FeatureWrapper',

  components: {
    RcTooltip,
  },

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

  computed: {
    shouldLock(): boolean {
      if (!this.feature.enabled && !this.feature.canEnable) {
        return true;
      }

      if (this.feature.enabled && !this.feature.canDisable) {
        return true;
      }

      return false;
    },
  },

  methods: {
    async onChange(toEnable: boolean) {
      const canNoLongerBeEnabled = !toEnable && this.feature.enabled && !this.feature.canEnable;
      const canNoLongerBeDisabled = toEnable && !this.feature.enabled && !this.feature.canDisable;

      if (canNoLongerBeEnabled || canNoLongerBeDisabled) {
        await this.confirmBeforeChange(toEnable);
      } else {
        await this.change(toEnable);
      }
    },

    async confirmBeforeChange(toEnable: boolean) {
      const title = toEnable ? this.$t('system_management.features.confirmEnable.title') : this.$t('system_management.features.confirmDisable.title');
      const messages = toEnable
        ? [this.$t('system_management.features.confirmEnable.message1'), this.$t('system_management.features.confirmEnable.message2')]
        : [this.$t('system_management.features.confirmDisable.message1'), this.$t('system_management.features.confirmDisable.message2')];

      const confirmed = await this.$confirm({ title, messages });

      if (confirmed) {
        await this.change(toEnable);
      } else {
        this.enabled = !toEnable;
      }
    },

    async change(toEnable: boolean) {
      this.loading = true;
      this.$nextTick(async () => { // Use nextTick to be able to roll back switch button if api call fails
        const result = toEnable
          ? await this.$storage.tenantSettings.actions.enableFeature(this.feature.id)
          : await this.$storage.tenantSettings.actions.disableFeature(this.feature.id);

        if (!result) {
          this.enabled = !toEnable; // roll back
        }

        this.loading = false;
      });
    },
  },
});
</script>
