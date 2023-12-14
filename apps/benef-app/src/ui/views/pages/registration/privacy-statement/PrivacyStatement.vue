<template>
  <privacy-statement-lib
    :checkbox-label="$t('registration.privacy_statement.agreeSelf_updated')"
    :consent-statement="consentStatement" />
</template>

<script lang="ts">
import Vue from 'vue';
import PrivacyStatementLib from '@libs/registration-lib/components/privacy-statement/PrivacyStatementLib.vue';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { IConsentStatement, FeatureKeys } from '@libs/entities-lib/tenantSettings';

export default Vue.extend({
  name: 'PrivacyStatement',
  components: {
    PrivacyStatementLib,
  },
  data() {
    return {
      FeatureKeys,
      consentStatement: null as IConsentStatement,
    };
  },

  async created() {
    this.consentStatement = (await this.getConsentStatement()) || null;
  },
  methods: {
    async getConsentStatement() : Promise<IConsentStatement> {
      return this.$services.tenantSettings.getConsentStatement(useRegistrationStore().event?.id);
    },
  },
});
</script>
