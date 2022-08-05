<template>
  <lib-review-registration :i18n="i18n" show-age-in-review skip-phone-email-rules :disable-autocomplete="!enableAutocomplete">
    <template #previous-events>
      <previous-events-template :case-files="caseFiles" :loading="loading" />
    </template>
  </lib-review-registration>
</template>

<script lang="ts">
import Vue from 'vue';
import LibReviewRegistration from '@libs/registration-lib/components/review/ReviewRegistration.vue';
import { HouseholdCreate } from '@libs/entities-lib/household-create';
import { IHouseholdCaseFile } from '@libs/entities-lib/household';
import { i18n } from '@/ui/plugins';
import PreviousEventsTemplate from '@/ui/views/pages/registration/review/PreviousEventsTemplate.vue';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

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

    enableAutocomplete(): boolean {
      return this.$hasFeature(FeatureKeys.AddressAutoFill);
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
