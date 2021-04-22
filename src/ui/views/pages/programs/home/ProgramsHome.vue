<template>
  <div>
    Programs Home
    <v-btn @click="create">
      Create Program
    </v-btn>
  </div>
</template>

<script lang="ts">
import routes from '@/constants/routes';
import Vue from 'vue';

export default Vue.extend({
  name: 'ProgramsHome',

  methods: {
    create() {
      this.$router.push({
        name: routes.programs.create.name,
      });
    },
  },
});
</script>
