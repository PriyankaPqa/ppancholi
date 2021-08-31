<template>
  <div>
    <h1>Financial assistance</h1>

    <v-btn @click="goToCreateFile()">
      Add with file
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';

export default Vue.extend({
  name: 'FinancialAssistanceHome',
  methods: {
    goToCreateFile() {
      this.$router.push({ name: routes.massActions.financialAssistance.create.name });
    },
  },
});
</script>

<style lang="scss" scoped>

</style>
