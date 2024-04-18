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
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { RcPageContent } from '@libs/component-lib/components';
import mixins from 'vue-typed-mixins';
import { i18n } from '@/ui/plugins';

import searchHousehold from '@/ui/mixins/searchHousehold';
import { IHouseholdSearchCriteria } from '@libs/registration-lib/types';
import { useHouseholdStore } from '@/pinia/household/household';
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
      caseFiles: null as ICaseFileEntity[],
      loading: false,
    };
  },

  computed: {
    showResultPage(): boolean {
      return useHouseholdStore().searchResultsShown;
    },
  },

  mounted() {
    // We get back results
    this.searchResults = this.combinedHouseholdStore.getByIds(useHouseholdStore().lastSearchResults).map((x) => x.entity);
  },

  methods: {
    async onSearch(criteria: IHouseholdSearchCriteria) {
      await this.search(criteria);
      useHouseholdStore().searchResultsShown = true;
    },

    back(): void {
      useHouseholdStore().searchResultsShown = false;
    },
  },
});
</script>
