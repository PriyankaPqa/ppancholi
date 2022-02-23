<template>
  <div id="ema__dashboard" class="full-height grey lighten-4">
    <app-header />
    <left-menu :mini.sync="miniLeftMenu" :show.sync="showLeftMenu" @update-mini="updateMini" />
    <right-menu />
    <general-help-menu :menu-links="helpMenuLinks" />
    <v-main :class="{'menu-container': paddingLeft}">
      <rc-router-view-transition />
    </v-main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcRouterViewTransition } from '@crctech/component-library';
import { INavigationTab } from '@/types';

import AppHeader from '@/ui/views/components/layout/AppHeader.vue';
import LeftMenu from '@/ui/views/components/layout/LeftMenu.vue';
import RightMenu from '@/ui/views/components/layout/RightMenu.vue';
import GeneralHelpMenu from '@/ui/views/components/layout/GeneralHelpMenu.vue';

export default Vue.extend({
  name: 'MainLayout',

  components: {
    AppHeader,
    LeftMenu,
    RightMenu,
    GeneralHelpMenu,
    RcRouterViewTransition,
  },
  data() {
    return {
      showLeftMenu: true,
      miniLeftMenu: true,
      paddingLeft: false,
      user: null,
    };
  },

  computed: {
    helpMenuLinks(): Array<INavigationTab> {
      return [{
        to: this.$t('zendesk.help_link.forgot_password').toString(),
        text: this.$t('zendesk.question.forgot_password'),
        test: 'zendesk-forgot-password',
      },
      {
        to: this.$t('zendesk.help_link.select_language_preferences').toString(),
        text: this.$t('zendesk.question.select_language_preferences'),
        test: 'zendesk-select-language-preferences',
      },
      {
        to: this.$t('zendesk.help_link.register_a_beneficiary').toString(),
        text: this.$t('zendesk.question.register_a_beneficiary'),
        test: 'zendesk-register-a-beneficiary',
      },
      {
        to: this.$t('zendesk.help_link.create_case_note').toString(),
        text: this.$t('zendesk.question.create_case_note'),
        test: 'zendesk-create-case-note',
      }];
    },
  },
  methods: {
    updateMini(val: boolean) {
      this.paddingLeft = val;
    },
  },
});
</script>

<style scoped lang="scss">
  .menu-container {
    padding-left: 80px !important;
  }
</style>
