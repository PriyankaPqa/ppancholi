<template>
  <rc-page-content
    content-padding="4"
    :title="$t('household.search.searchMembers')">
    <div>
      <household-search
        v-if="!showResultPage"
        class="mt-12"
        data-test="household-search"
        :loading="searchLoading"
        title="household.search.searchCriteria"
        @search="onSearch($event)" />
      <household-results
        v-if="showResultPage"
        :items="searchResults"
        data-test="household-results"
        hide-details-button
        hide-event-info
        link-to-household />
    </div>
    <template v-if="showResultPage" slot="actions">
      <v-btn data-test="cancel" @click.stop="back()">
        {{ $t('common.buttons.back') }}
      </v-btn>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import { IHouseholdCaseFile } from '@libs/entities-lib/household';
import { RcPageContent } from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import { i18n } from '@/ui/plugins';

import searchHousehold from '@/ui/mixins/searchHousehold';
import { IHouseholdSearchCriteria } from '@libs/registration-lib/types';
import HouseholdResults from './HouseholdResults.vue';
import HouseholdSearch from './HouseholdSearch.vue';

export default mixins(searchHousehold).extend({
  name: 'MainHouseholdSearch',

  components: {
    HouseholdSearch, HouseholdResults, RcPageContent,
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
    showResultPage(): boolean {
      return this.$store.state.householdEntities.searchResultsShown;
    },
  },

  mounted() {
    // We get back results
    this.searchResults = this.$storage.household.getters.getAll();
  },

  methods: {
    async onSearch(criteria: IHouseholdSearchCriteria) {
      await this.search(criteria);

      this.$storage.household.mutations.setSearchResultsShown(true);
    },

    back(): void {
      this.$storage.household.mutations.setSearchResultsShown(false);
    },
  },
});
</script>
