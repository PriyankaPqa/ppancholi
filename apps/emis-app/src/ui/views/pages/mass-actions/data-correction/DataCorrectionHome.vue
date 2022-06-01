<template>
  <div>
    <h1>DataCorrectionHome, list will be display here</h1>

    <router-link
      :to="routes.massActions.dataCorrection.create.path">
      Click to create
    </router-link>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';

export default Vue.extend({
  name: 'DataCorrectionHome',
  data: () => ({
    routes,
  }),
});
</script>

<style lang="scss" scoped>

</style>
