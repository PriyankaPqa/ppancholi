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
import { i18n } from '@/ui/plugins';
import PreviousEventsTemplate from '@/ui/views/pages/registration/review/PreviousEventsTemplate.vue';
import { HouseholdCreate } from '@crctech/registration-lib/src/entities/household-create';

export default Vue.extend({
  name: 'ReviewRegistration',

  components: {
    PreviousEventsTemplate,
    LibReviewRegistration,
  },

  data() {
    return {
      i18n,
      caseFiles: [],
      loading: false,
    };
  },

  computed: {
    household(): HouseholdCreate {
      return this.$storage.registration.getters.householdCreate();
    },
  },

  async mounted() {
    await this.fetchCaseFilesInformation(this.household.id);
  },

  methods: {
    async fetchCaseFilesInformation(householdId: string) {
      const filter = {
        Entity: { HouseholdId: householdId },
      };
      this.loading = true;
      try {
        const res = await this.$storage.caseFile.actions.search({
          filter,
        });
        this.caseFiles = this.$storage.caseFile.getters.getByIds(res.ids);
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
