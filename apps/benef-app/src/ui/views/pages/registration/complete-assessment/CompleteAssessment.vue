<template>
  <complete-assessment-lib />
</template>

<script lang="ts">
import Vue from 'vue';
import CompleteAssessmentLib from '@libs/registration-lib/components/complete-assessment/CompleteAssessmentLib.vue';

export default Vue.extend({
  name: 'CompleteAssessment',
  components: {
    CompleteAssessmentLib,
  },
});
</script>
