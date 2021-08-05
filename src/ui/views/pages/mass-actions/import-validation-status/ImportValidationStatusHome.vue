<template>
  <div>
    <h1>ImportValidationStatusHome</h1>
    <v-btn @click="goToAdd()">
      Add
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';

export default Vue.extend({
  name: 'ImportValidationStatusHome',

  methods: {
    goToAdd() {
      this.$router.push({ name: routes.massActions.importValidationStatus.create.name });
    },
  },
});
</script>

<style lang="scss" scoped>

</style>
