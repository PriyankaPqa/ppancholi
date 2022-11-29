<template>
  <privacy-statement-lib :checkbox-label="$t('registration.privacy_statement.agreeSelf')" />
</template>

<script lang="ts">
import Vue from 'vue';
import PrivacyStatementLib from '@libs/registration-lib/components/privacy-statement/PrivacyStatementLib.vue';

export default Vue.extend({
  name: 'PrivacyStatement',
  components: {
    PrivacyStatementLib,
  },
});
</script>
