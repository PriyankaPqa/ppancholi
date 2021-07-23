// Mixin used to fetch an household and rebuild the object so it can be used by UI components
// In registration and also in household profile

import Vue from 'vue';
import { IHouseholdCombined } from '@crctech/registration-lib/src/entities/household';
import { IMemberData } from '@crctech/registration-lib/src/entities/value-objects/member';
import { IIndigenousCommunityData } from '@crctech/registration-lib/src/entities/value-objects/identity-set';
import { IAddressData, IHouseholdCreateData } from '@crctech/registration-lib/src/entities/household-create';
import deepmerge from 'deepmerge';
import helpers from '@/ui/helpers';
import { IOptionItemData } from '@/entities/optionItem';

export default Vue.extend({
  methods: {
    async fetchHousehold(id: string) {
      const householdRes = await this.$storage.household.actions.fetch(id);
      const householdCreateData = await this.buildHouseholdCreateData(householdRes);
      return householdCreateData;
    },

    async fetchMembersInformation(household: IHouseholdCombined): Promise<IMemberData[]> {
      let primaryBeneficiaryPromise;
      const additionalMembersPromises = [] as Array<Promise<IMemberData>>;

      household.entity.members.forEach((id) => {
        const promise = this.$services.households.getPerson(id) as Promise<IMemberData>;

        if (id === household.entity.primaryBeneficiary) {
          primaryBeneficiaryPromise = promise;
        } else {
          additionalMembersPromises.push(promise);
        }
      });

      const members = await Promise.all([primaryBeneficiaryPromise, ...additionalMembersPromises]);
      return members;
    },

    async buildHouseholdCreateData(household: IHouseholdCombined): Promise<IHouseholdCreateData> {
      let primaryBeneficiary;
      const additionalMembers = [] as Array<IMemberData>;

      const genderItems = this.$storage.registration.getters.genders() as IOptionItemData[];
      const preferredLanguagesItems = this.$storage.registration.getters.preferredLanguages() as IOptionItemData[];
      const primarySpokenLanguagesItems = this.$storage.registration.getters.primarySpokenLanguages() as IOptionItemData[];

      const members = await this.fetchMembersInformation(household);

      const communitiesItems = await this.$storage.registration.actions.fetchIndigenousCommunities();

      const emptyCurrentAddress = {
        country: 'CA',
        streetAddress: null,
        unitSuite: null,
        province: null,
        specifiedOtherProvince: null,
        city: null,
        postalCode: null,
        latitude: 0,
        longitude: 0,
      } as IAddressData;

      members.forEach((m, index) => {
        const currentAddress = {
          ...m.currentAddress,
          address: m.currentAddress.address === null ? emptyCurrentAddress : m.currentAddress.address,
        };

        if (index === 0) {
          primaryBeneficiary = deepmerge(m, {
            identitySet: this.parseIdentitySet(m, communitiesItems, genderItems),
            contactInformation: this.parseContactInformation(m, preferredLanguagesItems, primarySpokenLanguagesItems),
            currentAddress,
          });
        } else {
          additionalMembers.push(deepmerge(m, {
            identitySet: this.parseIdentitySet(m, communitiesItems, genderItems),
            currentAddress,
          }));
        }
      });

      return {
        id: household.entity.id,
        registrationNumber: household.entity.registrationNumber,
        consentInformation: {
          crcUserName: '',
          registrationLocationId: '',
          registrationMethod: null,
          privacyDateTimeConsent: '',
        },
        primaryBeneficiary,
        homeAddress: household.entity.address.address,
        additionalMembers,
        noFixedHome: household.entity.address.address === null,
      };
    },

    parseIdentitySet(member: IMemberData, indigenousCommunities: IIndigenousCommunityData[], genderItems: IOptionItemData[]) {
      const indigenous = member.identitySet?.indigenousIdentity?.indigenousCommunityId
        ? indigenousCommunities.find((c) => c.id === member.identitySet.indigenousIdentity.indigenousCommunityId) : null;

      return {
        birthDate: helpers.convertBirthDateStringToObject(member.identitySet.dateOfBirth),
        genderOther: member.identitySet.gender.specifiedOther,
        gender: genderItems.find((i) => i.id === member.identitySet.gender.optionItemId),
        indigenousCommunityId: indigenous?.id,
        indigenousCommunityOther: member.identitySet?.indigenousIdentity?.specifiedOther,
        indigenousType: indigenous?.communityType,
      };
    },

    parseContactInformation(member: IMemberData, preferredLanguagesItems: IOptionItemData[], primarySpokenLanguagesItems: IOptionItemData[]) {
      const emptyPhone = {
        countryCode: 'CA',
        e164Number: '',
        extension: '',
        number: '',
      };

      const primarySpokenLanguage = member.contactInformation?.primarySpokenLanguage?.optionItemId
        ? primarySpokenLanguagesItems.find((i) => i.id === member.contactInformation.primarySpokenLanguage.optionItemId) : null;

      const preferredLanguage = member.contactInformation?.preferredLanguage?.optionItemId
        ? preferredLanguagesItems.find((i) => i.id === member.contactInformation.preferredLanguage.optionItemId) : null;

      const primarySpokenLanguageOther = member.contactInformation?.primarySpokenLanguage?.specifiedOther
        ? member.contactInformation.primarySpokenLanguage.specifiedOther : '';

      const preferredLanguageOther = member.contactInformation?.preferredLanguage?.specifiedOther
        ? member.contactInformation.preferredLanguage.specifiedOther : '';

      return {
        alternatePhoneNumber: member.contactInformation.alternatePhoneNumber || emptyPhone,
        mobilePhoneNumber: member.contactInformation.mobilePhoneNumber || emptyPhone,
        homePhoneNumber: member.contactInformation.homePhoneNumber || emptyPhone,
        preferredLanguage,
        primarySpokenLanguage,
        primarySpokenLanguageOther,
        preferredLanguageOther,
      };
    },
  },
});
