<template>
  <complete-assessment-lib :i18n="i18n" />
</template>

<script lang="ts">
import Vue from 'vue';
import CompleteAssessmentLib from '@libs/registration-lib/components/complete-assessment/CompleteAssessmentLib.vue';
import { i18n } from '@/ui/plugins';

export default Vue.extend({
  name: 'CompleteAssessment',
  components: {
    CompleteAssessmentLib,
  },
  data() {
    return {
      i18n,
    };
  },
});
</script>
