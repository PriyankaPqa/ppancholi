// Mixin used for household search in registration (EMIS) and household profile move

import Vue from 'vue';
import moment from '@/ui/plugins/moment';

export interface ICriteria {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone: string;
  registrationNumber:string;
  birthDate: string;
}

export default Vue.extend({
  data() {
    return {
      searchResults: [],
      criteria: {} as ICriteria,
      searchLoading: false,
    };
  },
  computed: {
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
  },

  methods: {
    async search(criteria: ICriteria) {
      this.searchLoading = true;
      this.criteria = criteria;
      this.$storage.household.mutations.reset();

      const res = await this.$storage.household.actions.search({
        search: this.searchCriteria,
        filter: this.filters,
        top: 999,
        queryType: 'full',
      });

      this.searchResults = this.$storage.household.getters.getByIds(res.ids);

      this.searchLoading = false;
    },
  },
});
