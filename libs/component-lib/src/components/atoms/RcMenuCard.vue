<template>
  <v-card class="pa-6">
    <h5 class="rc-heading-5 mb-3">
      {{ title }}
    </h5>

    <div class="cardText rc-body14">
      {{ text }}
    </div>

    <div>
      <v-btn
        color="primary"
        :loading="loadingPrimary"
        :disabled="disabledPrimary"
        :data-test="`${$attrs['data-test']}__button`"
        :to="routeName ? { name: routeName } : null"
        @click="$emit('click')">
        {{ buttonText }}
      </v-btn>

      <v-btn
        v-if="showSecondaryButton"
        :loading="loadingSecondary"
        :disabled="disabledSecondary"
        class="ml-4"
        color="grey lighten-4"
        :data-test="`${$attrs['data-test']}__button__secondary`"
        @click="$emit('click-secondary')">
        {{ secondaryButtonText }}
      </v-btn>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'RcMenuCard',

  props: {
    title: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
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
  },
});
</script>

<style scoped lang="scss">
.cardText {
  min-height: 125px;
}
</style>
