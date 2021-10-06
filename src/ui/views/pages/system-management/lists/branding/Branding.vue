<template>
  <rc-page-content :title="$t('system_management.lists.branding')" content-padding="10" :outer-scroll="true" :full-height="false">
    <v-container class="px-12">
      <colours class="px-12" :disable-edit-btn="disableEditBtn" :is-editing-colours.sync="isEditingColours" />

      <logo class="px-12" :disable-edit-btn="disableEditBtn" />

      <tenant-details class="px-12" :disable-edit-btn="disableEditBtn" :is-editing-tenant-details.sync="isEditingTenantDetails" />
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
import routes from '@/constants/routes';
import Colours from './Colours.vue';
import Logo from './Logo.vue';
import TenantDetails from './TenantDetails.vue';

export default Vue.extend({
  name: 'Branding',

  components: {
    RcPageContent,
    Colours,
    Logo,
    TenantDetails,
  },

  data() {
    return {
      isEditingColours: false,
      isEditingTenantDetails: false,
    };
  },

  computed: {
    disableEditBtn(): boolean {
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
