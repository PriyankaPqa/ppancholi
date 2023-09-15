<template>
  <v-navigation-drawer
    :value="show"
    app
    right
    temporary
    :width="$vuetify.breakpoint.xs ? '100%' : '450px'"
    :style="$vuetify.breakpoint.xs ? '' : `top: ${$vuetify.application.top}px`"
    :height="$vuetify.breakpoint.xs ? '100%' : `calc(100vh - ${$vuetify.application.top}px)`"
    @input="updateShow">
    <v-toolbar color="grey darken-2" height="56" flat dark>
      <v-toolbar-title class="rc-title-3 white--text" data-test="toolbar-title">
        {{ $t(titleKey) }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon data-test="close-button" @click="updateShow(false)">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <slot name="main" />

    <template #append>
      <slot name="footer" />
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'RightMenuTemplate',

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    titleKey: {
      type: String,
      required: true,
    },
  },

  methods: {
    updateShow(value: boolean) {
      this.$emit('update:show', value);
    },
  },
});
</script>
