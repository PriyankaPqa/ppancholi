<template>
  <div>
    Details of the mass action {{ massActionId }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'FinancialAssistanceDetails',

  computed: {
    massActionId(): string {
      return this.$route.params.id;
    },
  },
});
</script>
