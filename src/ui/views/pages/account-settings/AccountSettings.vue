<template>
  <rc-page-content :title="$t('noRoles.leftMenuTitle')" />
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent } from '@crctech/component-library';

export default Vue.extend({
  name: 'AccountSettings',
  components: {
    RcPageContent,
  },
});
</script>
