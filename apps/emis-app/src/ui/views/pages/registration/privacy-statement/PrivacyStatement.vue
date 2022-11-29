<template>
  <crc-privacy-statement :i18n="i18n" />
</template>
<script lang="ts">
import Vue from 'vue';
import { i18n } from '@/ui/plugins';
import CrcPrivacyStatement from '@libs/registration-lib/components/privacy-statement/CrcPrivacyStatement.vue';

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
});
</script>
