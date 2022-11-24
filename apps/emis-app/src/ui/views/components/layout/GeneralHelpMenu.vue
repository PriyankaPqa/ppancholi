<template>
  <v-navigation-drawer
    :value="show"
    right
    app
    :width="$vuetify.breakpoint.xs ? '100%' : '350px'"
    :height="$vuetify.breakpoint.xs ? '100%' : `calc(100vh - ${$vuetify.application.top}px)`"
    :style="$vuetify.breakpoint.xs ? '' : `top: ${$vuetify.application.top}px`"
    temporary
    @input="updateShow">
    <v-toolbar color="grey darken-2" height="56" flat dark>
      <v-toolbar-title class="rc-title-3 white--text">
        {{ $t('common.help') }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon data-test="close-button" @click="updateShow(false)">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

    <v-list class="pt-0">
      <template v-for="(link, index) in menuLinks">
        <v-list-item
          :key="link.key"
          :data-test="`general-help-item-${link.test}`"
          link
          :href="link.to"
          rel="noopener noreferrer"
          target="_blank">
          <v-list-item-title class="rc-link14" :data-test="`general-help-link-${link.test}`">
            {{ link.text }}
          </v-list-item-title>
          <v-list-item-icon>
            <v-icon right>
              mdi-menu-right
            </v-icon>
          </v-list-item-icon>
        </v-list-item>
        <v-divider :key="`link.key-${index}`" />
      </template>
    </v-list>

    <template #append>
      <v-row class="justify-center mb-6">
        <v-btn
          color="primary"
          data-test="help-center-button"
          :href="helpCenterLink"
          rel="noopener noreferrer"
          target="_blank">
          {{ $t('common.help_center.label') }}
        </v-btn>
      </v-row>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { INavigationTab } from '@libs/shared-lib/types';

export default Vue.extend({
  name: 'GeneralHelpMenu',

  props: {
    menuLinks: {
      type: Array as () => Array<INavigationTab>,
      default: null,
    },
  },

  computed: {
    show(): boolean {
      if (this.$store.state.dashboard) {
        return this.$store.state.dashboard.generalHelpMenuVisible;
      }
      return false;
    },

    helpCenterLink(): TranslateResult {
      return this.$t('zendesk.help_centre');
    },
  },

  methods: {
    updateShow(val: boolean) {
      this.$storage.dashboard.mutations.setProperty({
        property: 'generalHelpMenuVisible',
        value: val,
      });
    },
  },
});
</script>
