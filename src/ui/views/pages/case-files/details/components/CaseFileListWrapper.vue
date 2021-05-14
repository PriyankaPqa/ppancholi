<template>
  <div v-if="loading">
    <v-skeleton-loader class="my-6" type="article" />
    <v-skeleton-loader class="my-6" type="article" />
    <v-skeleton-loader class="my-6" type="article" />
  </div>
  <div v-else-if="empty">
    <div class="mt-4 rc-body14">
      {{ $t('caseFileList.noData') }}
    </div>
  </div>
  <div v-else>
    <slot name="default" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

/**
 * Wrapper for a case file list
 * Take care of displaying loading state and no data text
 */
export default Vue.extend({
  name: 'CaseFileListWrapper',

  props: {
    /**
     * Whether to show loading components
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to show the no data text
     */
    empty: {
      type: Boolean,
      required: true,
    },
  },
});
</script>
