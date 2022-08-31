<template>
  <div>
    <h1>Approvals table</h1>
    <v-btn @click="add()">
      Add a new table
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';

export default Vue.extend({
  name: 'ApprovalTablesTable',
  methods: {
    add() {
      this.$router.push({ name: routes.events.approvals.create.name });
    },
  },
});
</script>

<style lang="sccs" scoped>

</style>
