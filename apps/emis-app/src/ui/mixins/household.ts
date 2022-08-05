// Mixin used to fetch an household and rebuild the object so it can be used by UI components
// In registration and also in household profile

import Vue from 'vue';
import { IHouseholdCombined } from '@libs/entities-lib/household';
import { IMemberEntity } from '@libs/entities-lib/value-objects/member';
import { IIndigenousCommunityData } from '@libs/entities-lib/value-objects/identity-set';
import { IAddressData, IHouseholdCreateData } from '@libs/entities-lib/household-create';
import deepmerge from 'deepmerge';
import { ICurrentAddressCreateRequest } from '@libs/entities-lib/value-objects/current-address';
import householdHelpers from '@/ui/helpers/household';
import { IOptionItemData } from '@libs/entities-lib/optionItem';
import { EEventLocationStatus, EEventStatus, IEventGenericLocation } from '@libs/entities-lib/event';
import { CaseFileStatus } from '@libs/entities-lib/case-file';

export default Vue.extend({
  methods: {
    async fetchHouseholdCreate(id: string, shelterLocations: IEventGenericLocation[] = null) {
      const householdRes = await this.$storage.household.actions.fetch(id);
      const householdCreateData = await this.buildHouseholdCreateData(householdRes, shelterLocations);
      return householdCreateData;
    },

    async fetchMembersInformation(household: IHouseholdCombined, shelterLocations: IEventGenericLocation[]): Promise<IMemberEntity[]> {
      if (!household.entity.members?.length) {
        return [];
      }
      let primaryBeneficiaryPromise;
      const additionalMembersPromises = [] as Array<Promise<IMemberEntity>>;

      household.entity.members.forEach((id) => {
        const promise = this.$services.households.getPerson(id) as Promise<IMemberEntity>;

        if (id === household.entity.primaryBeneficiary) {
          primaryBeneficiaryPromise = promise;
        } else {
          additionalMembersPromises.push(promise);
        }
      });

      let members: IMemberEntity[] = await Promise.all([primaryBeneficiaryPromise, ...additionalMembersPromises]);

      if (shelterLocations) {
        members = this.addShelterLocationData(members, shelterLocations);
      }

      return members;
    },

    async fetchShelterLocations(household: IHouseholdCombined, onlyActive = true) {
      const shelters = [] as IEventGenericLocation[];
      const householdCaseFiles = household.metadata.caseFiles;
      if (householdCaseFiles) {
        const eventIds = householdCaseFiles
          .filter((c) => c.caseFileStatus === CaseFileStatus.Open || c.caseFileStatus === CaseFileStatus.Inactive)
          .map((cf) => cf.eventId);

        const resEvents = await this.$services.events.searchMyEvents({
          filter: `search.in(Entity/Id, '${eventIds.join('|')}', '|') and Entity/Schedule/Status eq ${EEventStatus.Open}`,
          top: 999,
        });

        const events = resEvents?.value;

        if (events) {
          events.forEach((e) => {
            if (e.entity.shelterLocations) {
              if (onlyActive) {
                const activeLocations = e.entity.shelterLocations.filter((s: IEventGenericLocation) => s.status === EEventLocationStatus.Active);
                shelters.push(...activeLocations);
              } else {
                shelters.push(...e.entity.shelterLocations);
              }
            }
          });
        }
        return shelters;
      }
      return [];
    },

    async buildHouseholdCreateData(
      household: IHouseholdCombined,
      shelterLocations: IEventGenericLocation[] = null,
    ): Promise<IHouseholdCreateData> {
      let primaryBeneficiary;
      const additionalMembers = [] as Array<IMemberEntity>;

      let shelters = [] as IEventGenericLocation[];

      // We get all shelter locations of all events linked to the household case files
      if (shelterLocations === null) {
        shelters = await this.fetchShelterLocations(household, false);
      }

      let genderItems = this.$storage.registration.getters.genders(true) as IOptionItemData[];

      if (genderItems.length === 0) {
        genderItems = await this.$storage.registration.actions.fetchGenders() as IOptionItemData[];
      }

      let preferredLanguagesItems = this.$storage.registration.getters.preferredLanguages() as IOptionItemData[];

      if (preferredLanguagesItems.length === 0) {
        preferredLanguagesItems = await this.$storage.registration.actions.fetchPreferredLanguages() as IOptionItemData[];
      }
      let primarySpokenLanguagesItems = this.$storage.registration.getters.primarySpokenLanguages(true) as IOptionItemData[];

      if (primarySpokenLanguagesItems.length === 0) {
        primarySpokenLanguagesItems = await this.$storage.registration.actions.fetchPrimarySpokenLanguages() as IOptionItemData[];
      }

      const members = await this.fetchMembersInformation(household, shelterLocations || shelters);

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
          address: !m.currentAddress || m.currentAddress.address === null ? emptyCurrentAddress : m.currentAddress.address,
        };

        const member = deepmerge(m, {
          identitySet: this.parseIdentitySet(m, communitiesItems, genderItems),
          contactInformation: this.parseContactInformation(m, preferredLanguagesItems, primarySpokenLanguagesItems),
          currentAddress,
        });

        if (index === 0) {
          primaryBeneficiary = member;
        } else {
          additionalMembers.push(member);
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
        homeAddress: household.entity.address?.address,
        additionalMembers,
        noFixedHome: household.entity.address?.address === null,
      };
    },

    parseIdentitySet(member: IMemberEntity, indigenousCommunities: IIndigenousCommunityData[], genderItems: IOptionItemData[]) {
      const indigenous = member.identitySet?.indigenousIdentity?.indigenousCommunityId
        ? indigenousCommunities.find((c) => c.id === member.identitySet.indigenousIdentity.indigenousCommunityId) : null;

      return {
        birthDate: householdHelpers.convertBirthDateStringToObject(member.identitySet.dateOfBirth),
        genderOther: member.identitySet.gender.specifiedOther,
        gender: genderItems.find((i) => i.id === member.identitySet.gender.optionItemId),
        indigenousCommunityId: indigenous?.id,
        indigenousCommunityOther: member.identitySet?.indigenousIdentity?.specifiedOther,
        indigenousType: indigenous?.communityType,
      };
    },

    parseContactInformation(member: IMemberEntity, preferredLanguagesItems: IOptionItemData[], primarySpokenLanguagesItems: IOptionItemData[]) {
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
        alternatePhoneNumber: member.contactInformation?.alternatePhoneNumber || emptyPhone,
        mobilePhoneNumber: member.contactInformation?.mobilePhoneNumber || emptyPhone,
        homePhoneNumber: member.contactInformation?.homePhoneNumber || emptyPhone,
        preferredLanguage,
        primarySpokenLanguage,
        primarySpokenLanguageOther,
        preferredLanguageOther,
      };
    },

    addShelterLocationData(members: IMemberEntity[], shelterLocations: IEventGenericLocation[]): IMemberEntity[] {
      return members.map((m) => ({
        ...m,
        currentAddress: {
          ...m.currentAddress,
          shelterLocation: shelterLocations
            .find((s: IEventGenericLocation) => s.id === (m.currentAddress as unknown as ICurrentAddressCreateRequest).shelterLocationId),
        },
      }));
    },
  },
});
