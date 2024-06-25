<template>
  <div>
    <household-search v-if="!showResultPage" :loading="searchLoading" :is-split-mode="isSplitMode" @search="onSearch($event)" />
    <household-results v-if="showResultPage" :items="searchResults" :is-split-mode="isSplitMode" link-to-household @showDetails="showDetails" />
    <rc-dialog
      v-if="showDetailsDialog"
      data-test="household-split-search-details-dialog"
      :title="$t('household.split.title.household_details')"
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
          <review-registration-lib :i18n="i18n" show-age-in-review skip-phone-email-rules :disable-autocomplete="!enableAutocomplete">
            <template #previous-events>
              <previous-events-template :household-id="selectedHouseholdId" />
            </template>
          </review-registration-lib>
        </v-col>
      </v-row>
    </rc-dialog>
  </div>
</template>

<script lang="ts">
import ReviewRegistrationLib from '@libs/registration-lib/components/review/ReviewRegistrationLib.vue';
import { RcDialog } from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import HouseholdSearch from '@/ui/views/pages/household/search/HouseholdSearch.vue';
import HouseholdResults from '@/ui/views/pages/household/search/HouseholdResults.vue';
import { i18n } from '@/ui/plugins';
import PreviousEventsTemplate from '@/ui/views/pages/registration/review/PreviousEventsTemplate.vue';
import { IHouseholdSearchCriteria } from '@libs/registration-lib/types';

import searchHousehold from '@/ui/mixins/searchHousehold';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { useRegistrationStore } from '@/pinia/registration/registration';
import { useHouseholdStore } from '@/pinia/household/household';

export default mixins(searchHousehold).extend({
  name: 'IsRegistered',
  components: {
    HouseholdSearch, HouseholdResults, ReviewRegistrationLib, PreviousEventsTemplate, RcDialog,
  },
  data() {
    return {
      FeatureKeys,
      i18n,
      showDetailsDialog: false,
      selectedHouseholdId: '',
    };
  },
  computed: {
    isSplitMode():boolean {
      return useRegistrationStore().isSplitMode();
    },
    showResultPage(): boolean {
      return useRegistrationStore().householdResultsShown;
    },

    enableAutocomplete(): boolean {
      return this.$hasFeature(FeatureKeys.AddressAutoFill);
    },
  },

  created() {
    // We get back results
    this.searchResults = useHouseholdStore().getByIds(useHouseholdStore().lastSearchResults);
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

      useRegistrationStore().householdResultsShown = true;
      // Hide the results on the main household search page, because they use the same store
      useHouseholdStore().searchResultsShown = false;
    },

    async showDetails(id:string) {
      this.selectedHouseholdId = id;
      this.showDetailsDialog = true;
    },

    // In the household split flow, the results list should not contain the household from which the split originates
    filterOutSplitHousehold() {
      const splitHouseholdId = useRegistrationStore().splitHouseholdState?.originHouseholdId;
      if (splitHouseholdId) {
        this.searchResults = this.searchResults.filter((r) => r.id !== splitHouseholdId);
      }
    },
  },
});
</script>
