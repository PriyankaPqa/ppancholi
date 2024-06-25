// Mixin used for household search in registration (EMIS) and household profile move

import Vue from 'vue';
import { IHouseholdSearchCriteria } from '@libs/registration-lib/types';
import { useHouseholdStore } from '@/pinia/household/household';
import { IHouseholdEntity, IHouseholdEntityWithMembers } from '@libs/entities-lib/household';
import { parseISO } from 'date-fns';
import { ISearchParams } from '@libs/shared-lib/types';
import { usePersonStore } from '@/pinia/person/person';

export default Vue.extend({
  data() {
    return {
      searchResults: [] as IHouseholdEntity[],
      criteria: {} as IHouseholdSearchCriteria,
      searchLoading: false,
    };
  },
  computed: {
    memberFilters(): Record<string, unknown> {
      const memberFilters = { and: [] as any[] };

      if (this.criteria.emailAddress) {
        memberFilters.and.push({ 'Person/ContactInformation/Email': this.criteria.emailAddress });
      }

      if (this.criteria.birthDate) {
        const date = parseISO(`${this.criteria.birthDate}Z`);
        memberFilters.and.push({ 'Person/IdentitySet/DateOfBirth': { eq: date } });
      }

      if (this.criteria.phone) {
        memberFilters.and.push({ or: [
          { 'Person/ContactInformation/HomePhoneNumber/E164Number': this.criteria.phone },
          { 'Person/ContactInformation/MobilePhoneNumber/E164Number': this.criteria.phone },
          { 'Person/ContactInformation/AlternatePhoneNumber/E164Number': this.criteria.phone },
        ],
        });
      }

      if (this.criteria.firstName) {
        memberFilters.and.push({ 'Person/IdentitySet/FirstName': { contains: this.criteria.firstName } });
      }

      if (this.criteria.lastName) {
        memberFilters.and.push({ 'Person/IdentitySet/LastName': { contains: this.criteria.lastName } });
      }
      return memberFilters;
    },

    filters(): Record<string, unknown> {
      return {
        'Entity/RegistrationNumber': this.criteria.registrationNumber,
        Entity: { HouseholdMembers: { any: { ...this.memberFilters } } },
      };
    },
  },

  methods: {
    async search(criteria: IHouseholdSearchCriteria) {
      this.searchLoading = true;
      this.criteria = criteria;
      useHouseholdStore().lastSearchResults = [];

      const res = await useHouseholdStore().search({
        params: {
        filter: this.filters,
        includeMembers: true, // loads members at the same time - returns IHouseholdEntityWithMembers
      } as ISearchParams,
      includeInactiveItems: false });
      if (res?.values) {
        usePersonStore().setAll(res.values.flatMap((x: IHouseholdEntityWithMembers) => x.householdMembers?.map((x) => x.person)));
      }

      if (res?.ids) {
        this.searchResults = useHouseholdStore().getByIds(res.ids);

        useHouseholdStore().lastSearchResults = res.ids;
      }

      this.searchLoading = false;
    },
  },
});
