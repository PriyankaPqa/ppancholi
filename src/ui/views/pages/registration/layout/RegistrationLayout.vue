<template>
  <div class="fill-height">
    <rc-router-view-transition />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { RcRouterViewTransition } from '@crctech/component-library';
import metadata from '@/ui/mixins/metadata';

export default Vue.extend({
  name: 'RegistrationLayout',
  components: {
    RcRouterViewTransition,
  },
  mixins: [metadata],

  computed: {
    metaTitle(): TranslateResult {
      return this.$t('metaInfo.crc_registration.title');
    },
    metaDescription(): TranslateResult {
      return this.$t('metaInfo.crc_registration.description');
    },
  },
});
</script>
