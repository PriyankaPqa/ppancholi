<template>
  <div>
    <household-search v-if="!showResultPage" :loading="searchLoading" :is-split-mode="isSplitMode" @search="search($event)" />
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
          <lib-review-registration :i18n="i18n" show-age-in-review skip-phone-email-rules>
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
import Vue from 'vue';
import { ReviewRegistration as LibReviewRegistration } from '@crctech/registration-lib';
import { RcDialog } from '@crctech/component-library';
import { IHouseholdCaseFile } from '@crctech/registration-lib/src/entities/household';
import HouseholdSearch from '@/ui/views/pages/registration/is-registered/HouseholdSearch.vue';
import HouseholdResults from '@/ui/views/pages/registration/is-registered/HouseholdResults.vue';
import moment from '@/ui/plugins/moment';
import { i18n } from '@/ui/plugins';
import PreviousEventsTemplate from '@/ui/views/pages/registration/review/PreviousEventsTemplate.vue';

export interface ICriteria {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone: string;
  registrationNumber:string;
  birthDate: string;
}

export default Vue.extend({
  name: 'IsRegistered',
  components: {
    HouseholdSearch, HouseholdResults, LibReviewRegistration, PreviousEventsTemplate, RcDialog,
  },
  data() {
    return {
      i18n,
      searchResults: [],
      criteria: {} as ICriteria,
      showDetailsDialog: false,
      caseFiles: null as IHouseholdCaseFile[],
      loading: false,
    };
  },
  computed: {
    showResultPage(): boolean {
      return this.$store.state.registration.householdResultsShown;
    },

    searchLoading(): boolean {
      return this.$store.state.householdEntities.searchLoading;
    },

    metadataFilters(): Record<string, unknown> {
      const metadataFilters = {} as Record<string, unknown>;

      if (this.criteria.emailAddress) {
        metadataFilters.Email = this.criteria.emailAddress;
      }

      if (this.criteria.birthDate) {
        metadataFilters.DateOfBirth = moment.utc(this.criteria.birthDate).format();
      }

      if (this.criteria.phone) {
        metadataFilters.or = [
          { 'HomePhoneNumber/E164Number': this.criteria.phone },
          { 'MobilePhoneNumber/E164Number': this.criteria.phone },
          { 'AlternatePhoneNumber/E164Number': this.criteria.phone },
        ];
      }
      return metadataFilters;
    },

    searchCriteria(): string {
      if (this.criteria.firstName && this.criteria.lastName) {
        return `Metadata/MemberMetadata/FirstName:/.*${this.criteria.firstName}.*/
        AND Metadata/MemberMetadata/LastName:/.*${this.criteria.lastName}.*/`;
      }
      if (this.criteria.firstName) {
        return `Metadata/MemberMetadata/FirstName:/.*${this.criteria.firstName}.*/`;
      }
      if (this.criteria.lastName) {
        return `Metadata/MemberMetadata/LastName:/.*${this.criteria.lastName}.*/`;
      }
      return '';
    },

    filters(): Record<string, unknown> {
      return {
        and: [
          {
            Metadata: {
              MemberMetadata: {
                any: {
                  ...this.metadataFilters,
                },
              },
            },
          },
          {
            Entity: {
              RegistrationNumber: this.criteria.registrationNumber,
            },
          },
        ],
      };
    },

    isSplitMode():boolean {
      return this.$storage.registration.getters.isSplitMode();
    },
  },

  mounted() {
    // We get back results
    this.searchResults = this.$storage.household.getters.getAll();
    if (this.isSplitMode) {
      this.filterOutSplittedHousehold();
    }
  },

  methods: {
    async search(criteria: ICriteria) {
      this.criteria = criteria;
      this.$storage.household.mutations.reset();

      const res = await this.$storage.household.actions.search({
        search: this.searchCriteria,
        filter: this.filters,
        top: 999,
        queryType: 'full',
      });
      this.searchResults = this.$storage.household.getters.getByIds(res.ids);
      if (this.isSplitMode) {
        this.filterOutSplittedHousehold();
      }

      this.$storage.registration.mutations.setHouseholdResultsShown(true);
    },

    async showDetails(id:string) {
      await this.fetchCaseFilesInformation(id);
      this.showDetailsDialog = true;
    },

    // In the household split flow, the results list should not contain the household from which the split originates
    filterOutSplittedHousehold() {
      const splittedHouseholdId = this.$store.state.registration.splitHousehold?.originHouseholdId;
      if (splittedHouseholdId) {
        this.searchResults = this.searchResults.filter((r) => r.entity.id !== splittedHouseholdId);
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
