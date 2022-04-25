<template>
  <rc-page-content :title="$t('system_management.lists.tenantSettings')" content-padding="0" :outer-scroll="true" :full-height="true">
    <div>
      <v-container class="px-12">
        <slug ref="slug" :disable-edit-btn="isEditing" :is-editing.sync="isEditing" />

        <domains ref="domains" :disable-edit-btn="isEditing" :is-editing.sync="isEditing" />

        <support-emails ref="supportEmails" :disable-edit-btn="isEditing" :is-editing.sync="isEditing" />
      </v-container>
    </div>

    <template slot="actions">
      <v-btn color="primary" data-test="branding-back-btn" @click="back()">
        {{ $t('common.button.back') }}
      </v-btn>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent } from '@libs/component-lib/components';
import { Route, NavigationGuardNext } from 'vue-router';
import helpers from '@/ui/helpers/helpers';
import routes from '@/constants/routes';
import Slug from './Slug.vue';
import Domains from './Domains.vue';
import SupportEmails from './SupportEmails.vue';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default Vue.extend({
  name: 'TenantSettings',

  components: {
    RcPageContent,
    Slug,
    Domains,
    SupportEmails,
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    const slugDirty = (this.$refs.slug as any).isDirty;
    const domainsDirty = (this.$refs.domains as any).isDirty;
    const supportEmailsDirty = (this.$refs.supportEmails as any).isDirty;
    const isDirty = this.isEditing && (slugDirty || domainsDirty || supportEmailsDirty);

    await helpers.confirmBeforeLeaving(this, isDirty, next);
  },

  data() {
    return {
      isEditing: false,

    };
  },

  methods: {
    back() {
      this.$router.replace({
        name: routes.systemManagement.home.name,
      });
    },
  },
});
</script>

<style>

.tenant-settings-msg {
  height: 32px;
  background-color: var(--v-status_yellow_pale-base);
  display: flex;
  align-items: center;
}
</style>
