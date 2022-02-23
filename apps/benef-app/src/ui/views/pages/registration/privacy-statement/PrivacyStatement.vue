<template>
  <lib-privacy-statement :checkbox-label="$t('registration.privacy_statement.agreeSelf')" />
</template>

<script lang="ts">
import Vue from 'vue';
import LibPrivacyStatement from '@libs/registration-lib/components/privacy-statement/PrivacyStatement.vue';

export default Vue.extend({
  name: 'PrivacyStatement',
  components: {
    LibPrivacyStatement,
  },
});
</script>
