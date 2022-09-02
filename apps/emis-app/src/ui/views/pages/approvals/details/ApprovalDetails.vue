<template>
  <div>
    <v-alert type="info" prominent border="left">
      This is details page of approval {{ approvalId }}. It is not yet implemented.
    </v-alert>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ApprovalDetails',
  computed: {
    approvalId(): string {
      return this.$route.params.approvalId;
    },
  },
});
</script>
