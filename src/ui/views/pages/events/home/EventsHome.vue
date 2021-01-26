<template>
  <v-container>
    <v-row no-gutters>
      <v-col :cols="12">
        <v-btn @click="addEvent">
          Click here to add event
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';

export default Vue.extend({
  name: 'EventsHome',
  methods: {
    addEvent() {
      this.$router.push({ name: routes.events.create.name });
    },
  },
});
</script>
