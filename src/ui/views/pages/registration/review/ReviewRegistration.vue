<template>
  <lib-review-registration :i18n="i18n" show-age-in-review skip-phone-email-rules>
    <template #previous-events>
      <previous-events-template :case-files="caseFiles" :loading="loading" />
    </template>
  </lib-review-registration>
</template>

<script lang="ts">
import Vue from 'vue';
import { ReviewRegistration as LibReviewRegistration } from '@crctech/registration-lib';
import { HouseholdCreate } from '@crctech/registration-lib/src/entities/household-create';
import { IHouseholdCaseFile } from '@crctech/registration-lib/src/entities/household';
import { i18n } from '@/ui/plugins';
import PreviousEventsTemplate from '@/ui/views/pages/registration/review/PreviousEventsTemplate.vue';

export default Vue.extend({
  name: 'ReviewRegistration',

  components: {
    PreviousEventsTemplate,
    LibReviewRegistration,
  },

  data() {
    return {
      i18n,
      caseFiles: [] as IHouseholdCaseFile[],
      loading: false,
    };
  },

  computed: {
    household(): HouseholdCreate {
      return this.$storage.registration.getters.householdCreate();
    },
  },

  async mounted() {
    if (this.household?.id) {
      await this.fetchCaseFilesInformation(this.household.id);
    }
  },

  methods: {
    async fetchCaseFilesInformation(householdId: string) {
      this.loading = true;
      try {
        const household = await this.$storage.household.actions.fetch(householdId);
        if (household) {
          this.caseFiles = household.metadata.caseFiles;
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
