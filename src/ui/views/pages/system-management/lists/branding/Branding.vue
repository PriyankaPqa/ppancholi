<template>
  <rc-page-content :title="$t('system_management.lists.branding')" content-padding="10" :outer-scroll="true" :full-height="true">
    <v-container class="px-12">
      <colours
        ref="colours"
        class="px-12"
        :disable-edit-btn="isEditingBranding"
        :is-editing-colours.sync="isEditingColours" />

      <logo ref="logo" class="px-12" :disable-edit-btn="isEditingBranding" />

      <tenant-details
        ref="tenantDetails"
        class="px-12"
        :disable-edit-btn="isEditingBranding"
        :is-editing-tenant-details.sync="isEditingTenantDetails" />
    </v-container>

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
import routes from '@/constants/routes';
import Colours from './Colours.vue';
import Logo from './Logo.vue';
import TenantDetails from './TenantDetails.vue';
import helpers from '@/ui/helpers';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default Vue.extend({
  name: 'Branding',

  components: {
    RcPageContent,
    Colours,
    Logo,
    TenantDetails,
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    const colourDirty = (this.$refs.colours as any).isDirty;
    const logoDirty = (this.$refs.logo as any).isDirty;
    const tenantDetailsDirty = (this.$refs.tenantDetails as any).isDirty;
    const isDirty = colourDirty || logoDirty || tenantDetailsDirty;

    await helpers.confirmBeforeLeaving(this, this.isEditingBranding && isDirty, next);
  },

  data() {
    return {
      isEditingColours: false,
      isEditingTenantDetails: false,
    };
  },

  computed: {
    isEditingBranding(): boolean {
      return this.isEditingColours || this.isEditingTenantDetails;
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
