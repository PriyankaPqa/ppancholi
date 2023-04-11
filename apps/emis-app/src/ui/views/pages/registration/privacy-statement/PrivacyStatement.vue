<template>
  <crc-privacy-statement :i18n="i18n" :user="user" :consent-statements="consentStatements" />
</template>
<script lang="ts">
import Vue from 'vue';
import { i18n } from '@/ui/plugins';
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
  data() {
    return {
      i18n,
    };
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
