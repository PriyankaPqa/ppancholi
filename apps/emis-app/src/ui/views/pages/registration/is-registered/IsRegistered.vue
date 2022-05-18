<template>
  <div>
    <household-search v-if="!showResultPage" :loading="searchLoading" :is-split-mode="isSplitMode" @search="onSearch($event)" />
    <household-results v-if="showResultPage" :items="searchResults" :is-split-mode="isSplitMode" @showDetails="showDetails" />
    <rc-dialog
      v-if="showDetailsDialog"
      data-test="household-split-search-details-dialog"
      :title="$t('household.split.title.beneficiary_details')"
      :show-cancel="false"
      :submit-action-label="$t('common.close')"
      :show.sync="showDetailsDialog"
      :content-only-scrolling="true"
      persistent
      fullscreen
      @close="showDetailsDialog = false"
      @submit="showDetailsDialog = false">
      <v-row justify="center">
        <v-col cols="12" lg="8">
          <lib-review-registration :i18n="i18n" show-age-in-review skip-phone-email-rules :disable-autocomplete="!enableAutocomplete">
            <template #previous-events>
              <previous-events-template :case-files="caseFiles" :loading="loading" />
            </template>
          </lib-review-registration>
        </v-col>
      </v-row>
    </rc-dialog>
  </div>
</template>

<script lang="ts">
import LibReviewRegistration from '@libs/registration-lib/components/review/ReviewRegistration.vue';
import { RcDialog } from '@libs/component-lib/components';
import { IHouseholdCaseFile } from '@libs/registration-lib/entities/household';
import mixins from 'vue-typed-mixins';
import HouseholdSearch from '@/ui/views/pages/household/search/HouseholdSearch.vue';
import HouseholdResults from '@/ui/views/pages/household/search/HouseholdResults.vue';
import { i18n } from '@/ui/plugins';
import PreviousEventsTemplate from '@/ui/views/pages/registration/review/PreviousEventsTemplate.vue';
import { IHouseholdSearchCriteria } from '@libs/registration-lib/types';

import searchHousehold from '@/ui/mixins/searchHousehold';
import { FeatureKeys } from '@/entities/tenantSettings';

export default mixins(searchHousehold).extend({
  name: 'IsRegistered',
  components: {
    HouseholdSearch, HouseholdResults, LibReviewRegistration, PreviousEventsTemplate, RcDialog,
  },
  data() {
    return {
      i18n,
      showDetailsDialog: false,
      caseFiles: null as IHouseholdCaseFile[],
      loading: false,
    };
  },
  computed: {
    isSplitMode():boolean {
      return this.$storage.registration.getters.isSplitMode();
    },
    showResultPage(): boolean {
      return this.$store.state.registration.householdResultsShown;
    },

    enableAutocomplete(): boolean {
      return this.$hasFeature(FeatureKeys.AddressAutoFill);
    },
  },

  mounted() {
    // We get back results
    this.searchResults = this.$storage.household.getters.getAll();
    if (this.isSplitMode) {
      this.filterOutSplitHousehold();
    }
  },

  methods: {
    async onSearch(criteria: IHouseholdSearchCriteria) {
      await this.search(criteria);

      if (this.isSplitMode) {
        this.filterOutSplitHousehold();
      }

      this.$storage.registration.mutations.setHouseholdResultsShown(true);
      // Hide the results on the main household search page, because they use the same store
      this.$storage.household.mutations.setSearchResultsShown(false);
    },

    async showDetails(id:string) {
      await this.fetchCaseFilesInformation(id);
      this.showDetailsDialog = true;
    },

    // In the household split flow, the results list should not contain the household from which the split originates
    filterOutSplitHousehold() {
      const splitHouseholdId = this.$store.state.registration.splitHousehold?.originHouseholdId;
      if (splitHouseholdId) {
        this.searchResults = this.searchResults.filter((r) => r.entity.id !== splitHouseholdId);
      }
    },

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
