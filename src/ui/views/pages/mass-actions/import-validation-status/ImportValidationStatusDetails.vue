<template>
  <h1>ImportValidationStatusDetails {{ massActionId }}</h1>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ImportValidationStatusDetails',
  computed: {
    massActionId(): string {
      return this.$route.params.id;
    },
  },
});
</script>
