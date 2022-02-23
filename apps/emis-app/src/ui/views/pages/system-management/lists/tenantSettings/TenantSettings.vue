<template>
  <rc-page-content :title="$t('system_management.lists.tenantSettings')" content-padding="0" :outer-scroll="true" :full-height="true">
    <div>
      <div class="msg rc-body14">
        <v-icon color="status_error" small class="ml-3 mr-2">
          mdi-alert
        </v-icon>
        {{ $t('system_management.userAccounts.tenantSettings.warning.message') }}
      </div>

      <v-container class="px-12">
        <slug ref="slug" :disable-edit-btn="isEditing" :is-editing-slug.sync="isEditingSlug" />

        <domains ref="domains" :disable-edit-btn="isEditing" :is-editing-domains.sync="isEditingDomains" />
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
import { RcPageContent } from '@crctech/component-library';
import { Route, NavigationGuardNext } from 'vue-router';
import Slug from './Slug.vue';
import Domains from './Domains.vue';
import helpers from '@/ui/helpers/helpers';
import routes from '@/constants/routes';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default Vue.extend({
  name: 'TenantSettings',

  components: {
    RcPageContent,
    Slug,
    Domains,
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    const slugDirty = this.isEditingSlug && (this.$refs.slug as any).isDirty;
    const domainsDirty = this.isEditingDomains && (this.$refs.domains as any).isDirty;
    const isDirty = slugDirty || domainsDirty;

    await helpers.confirmBeforeLeaving(this, isDirty, next);
  },

  data() {
    return {
      isEditingSlug: false,
      isEditingDomains: false,
    };
  },

  computed: {
    isEditing(): boolean {
      return this.isEditingSlug || this.isEditingDomains;
    },
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

<style scoped>
.msg {
  height: 32px;
  background-color: #ffe5db;
  display: flex;
  align-items: center;
}
</style>
