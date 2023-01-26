<template>
  <div class="mt-n12 fixed-height">
    <div class="fixed-height flex-container">
      <div class="mx-auto my-auto text-center">
        <div class="ma-6">
          <v-icon color="red" size="128">
            {{ currentTab.icon }}
          </v-icon>
        </div>
        <div class="rc-title-2 fw-bold ma-6">
          {{ $m(registrationAssessment.sectionTitle) }}
        </div>
        <div class="rc-body16 grey--text text--darken-2 ma-6">
          {{ $m(registrationAssessment.details) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { IRegistrationAssessment } from '@libs/entities-lib/src/event';
import { IRegistrationMenuItem } from '@libs/registration-lib/types';
import Vue from 'vue';

export default Vue.extend({
  name: 'CompleteAssessmentLib',

  computed: {
    currentTab(): IRegistrationMenuItem {
      return this.$registrationStore.getCurrentTab();
    },
    registrationAssessment(): IRegistrationAssessment {
      return this.$registrationStore.getAssessmentToComplete().registrationAssessment;
    },
  },
});
</script>

<style scoped lang="scss">
.fixed-height {
  height: 100%;
}

.flex-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
