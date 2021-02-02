<template>
  <div class="fill-height">
    <router-view-transition />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import metadata from '@/ui/mixins/metadata';
import RouterViewTransition from '@/ui/shared-components/RouterViewTransition.vue';

export default Vue.extend({
  name: 'RegistrationLayout',
  components: {
    RouterViewTransition,
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
