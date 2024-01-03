<template>
  <v-card class="card pa-4">
    <div class="rc-heading-5">
      {{ title }}
    </div>

    <div class="cardText rc-body14">
      {{ text }}
    </div>

    <div class="actions">
      <v-btn
        color="primary"
        :loading="loadingPrimary"
        :disabled="disabledPrimary"
        :data-test="`${$attrs['data-test']}__button`"
        :to="routeName ? { name: routeName } : route"
        @click="$emit('click')">
        {{ buttonText }}
      </v-btn>

      <template v-if="showSecondaryButton">
        <v-btn
          v-if="!secondaryMenu"
          class="secondaryButton"
          :loading="loadingSecondary"
          :disabled="disabledSecondary"
          color="grey lighten-4"
          :data-test="`${$attrs['data-test']}__button__secondary`"
          @click="$emit('click-secondary')">
          {{ secondaryButtonText }}
        </v-btn>
        <rc-menu
          v-else
          color="grey lighten-4"
          :item-text="(item) => $t(item.text)"
          :items="secondaryMenuItems"
          :button-label="secondaryButtonText"
          @click="$emit('click-secondary-menu', $event)" />
      </template>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import RcMenu from './RcMenu.vue';

export default Vue.extend({
  name: 'RcMenuCard',
  components: {
    RcMenu,
  },

  props: {
    title: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      default: '',
    },

    buttonText: {
      type: String,
      required: true,
    },

    showSecondaryButton: {
      type: Boolean,
      default: false,
    },

    secondaryButtonText: {
      type: String,
      default: '',
    },

    routeName: {
      type: String,
      default: '',
    },

    route: {
      type: Object,
      default: null,
    },

    loadingPrimary: {
      type: Boolean,
      default: false,
    },

    loadingSecondary: {
      type: Boolean,
      default: false,
    },

    disabledPrimary: {
      type: Boolean,
      default: false,
    },

    disabledSecondary: {
      type: Boolean,
      default: false,
    },

    secondaryMenu: {
      type: Boolean,
      default: false,
    },

    secondaryMenuItems: {
      type: Array as () => Record<string, string>[],
      default: () => [] as Record<string, string>[],
    },
  },
});
</script>

<style scoped  lang="scss">

@media only screen and (min-width: $breakpoint-sm-min) and (max-width: $breakpoint-lg-min) {
  .card {
    min-height: 200px;
  };
}
.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  min-height: 200px;
}

.actions {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
}

@media only screen and (min-width: $breakpoint-md-min) and (max-width: $breakpoint-lg-max) {
  .actions {
    flex-direction: column;
     > ::v-deep .secondaryButton {
      margin-top: 8px;
    }
  }
}

</style>
