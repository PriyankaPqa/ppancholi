// Mixin used for household search in registration (EMIS) and household profile move

import Vue from 'vue';
import { IHouseholdSearchCriteria } from '@libs/registration-lib/types';
import { useHouseholdMetadataStore, useHouseholdStore } from '@/pinia/household/household';
import { CombinedStoreFactory } from '@libs/stores-lib/base/combinedStoreFactory';
import { IdParams, IHouseholdEntity, IHouseholdMetadata } from '@libs/entities-lib/household';
import { parseISO, format } from 'date-fns';

export default Vue.extend({
  data() {
    return {
      searchResults: [],
      criteria: {} as IHouseholdSearchCriteria,
      searchLoading: false,
      combinedHouseholdStore: new CombinedStoreFactory<IHouseholdEntity, IHouseholdMetadata, IdParams>(useHouseholdStore(), useHouseholdMetadataStore()),
    };
  },
  computed: {
    metadataFilters(): Record<string, unknown> {
      const metadataFilters = {} as Record<string, unknown>;

      if (this.criteria.emailAddress) {
        metadataFilters.Email = this.criteria.emailAddress;
      }

      if (this.criteria.birthDate) {
        metadataFilters.DateOfBirth = format(parseISO(this.criteria.birthDate), "yyyy-MM-dd'T'HH:mm:ss'Z'");
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
        return `(Metadata/MemberMetadata/FirstName:/.*${this.criteria.firstName}.*/ OR Metadata/MemberMetadata/FirstName:"\\"${this.criteria.firstName}\\"")
        AND (Metadata/MemberMetadata/LastName:/.*${this.criteria.lastName}.*/ OR Metadata/MemberMetadata/LastName:"\\"${this.criteria.lastName}\\"")`;
      }
      if (this.criteria.firstName) {
        return `Metadata/MemberMetadata/FirstName:/.*${this.criteria.firstName}.*/ OR Metadata/MemberMetadata/FirstName:"\\"${this.criteria.firstName}\\""`;
      }
      if (this.criteria.lastName) {
        return `Metadata/MemberMetadata/LastName:/.*${this.criteria.lastName}.*/ OR Metadata/MemberMetadata/LastName:"\\"${this.criteria.lastName}\\""`;
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
  },

  methods: {
    async search(criteria: IHouseholdSearchCriteria) {
      this.searchLoading = true;
      this.criteria = criteria;
      useHouseholdStore().lastSearchResults = [];

      const res = await this.combinedHouseholdStore.search({
        search: this.searchCriteria,
        filter: this.filters,
        top: 999,
        queryType: 'full',
      });

      if (res?.ids) {
        this.searchResults = this.combinedHouseholdStore.getByIds(res.ids);
        useHouseholdStore().lastSearchResults = res.ids;
      }

      this.searchLoading = false;
    },
  },
});
