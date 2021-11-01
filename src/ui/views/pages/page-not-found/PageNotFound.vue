<template>
  <div class="container">
    <div class="error-banner">
      <div class="error-message">
        <h3 class="rc-heading-3" data-test="pageNotFound__title">
          {{ $t('pageNotFound.title') }}
        </h3>

        <p class="rc-body14" data-test="pageNotFound__message">
          {{ $t('pageNotFound.message') }} test
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'PageNotFound',
});
</script>
