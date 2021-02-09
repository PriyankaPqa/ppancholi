<template>
  <div class="container">
    <div class="error-banner">
      <div class="error-message">
        <h3 class="rc-heading-3">
          {{ $t('pageNotFound.title') }}
        </h3>

        <p class="rc-body14">
          {{ $t('pageNotFound.message') }}
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
