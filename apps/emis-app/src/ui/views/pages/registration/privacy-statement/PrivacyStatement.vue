<template>
  <crc-privacy-statement :i18n="i18n" :user="user" />
</template>
<script lang="ts">
import Vue from 'vue';
import { i18n } from '@/ui/plugins';
import CrcPrivacyStatement from '@libs/registration-lib/components/privacy-statement/CrcPrivacyStatement.vue';
import { IUser } from '@libs/entities-lib/user';
import { useUserStore } from '@/pinia/user/user';

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
  },
});
</script>
