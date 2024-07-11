<template>
  <crc-privacy-statement :user="user" :consent-statements="consentStatements" />
</template>
<script lang="ts">
import Vue from 'vue';
import CrcPrivacyStatement from '@libs/registration-lib/components/privacy-statement/CrcPrivacyStatement.vue';
import { IUser } from '@libs/entities-lib/user';
import { useUserStore } from '@/pinia/user/user';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { IConsentStatement } from '@libs/entities-lib/tenantSettings';

export default Vue.extend({
  name: 'PrivacyStatement',
  components: {
    CrcPrivacyStatement,
  },
  computed: {
    user(): IUser {
      return useUserStore().getUser();
    },
    consentStatements(): Array<IConsentStatement> {
      return useTenantSettingsStore().currentTenantSettings.consentStatements;
    },
  },
});
</script>
