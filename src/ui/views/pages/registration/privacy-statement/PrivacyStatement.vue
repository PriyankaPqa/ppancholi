<template>
  <lib-privacy-statement :checkbox-label="$t('registration.privacy_statement.agreeSelf')" />
</template>

<script lang="ts">
import Vue from 'vue';
import { PrivacyStatement as LibPrivacyStatement } from '@crctech/registration-lib';

export default Vue.extend({
  name: 'PrivacyStatement',
  components: {
    LibPrivacyStatement,
  },
});
</script>
