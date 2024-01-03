<template>
  <v-card class="pa-6">
    <div class="rc-heading-5 mb-3">
      {{ title }}
    </div>

    <div class="cardText rc-body14">
      {{ text }}
    </div>

    <v-btn
      color="primary"
      :data-test="`${$attrs['data-test']}__button`"
      :to="routeName ? { name: routeName } : null"
      @click="$emit('click')">
      {{ buttonText }}
    </v-btn>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'MenuCard',

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

    routeName: {
      type: String,
      default: '',
    },
  },
});
</script>

<style scoped lang="scss">
.cardText {
  min-height: 125px;
}
</style>
