// Mixin used to fetch an household and rebuild the object so it can be used by UI components
// In registration and also in household profile

import Vue from 'vue';
import { IHouseholdCombined } from '@libs/entities-lib/household';
import { IMemberEntity } from '@libs/entities-lib/value-objects/member';
import { IIndigenousCommunityData } from '@libs/entities-lib/value-objects/identity-set';
import { IAddressData, IHouseholdCreateData } from '@libs/entities-lib/household-create';
import deepmerge from 'deepmerge';
import householdHelpers from '@/ui/helpers/household';
import { IOptionItemData } from '@libs/shared-lib/types';
import { IEventGenericLocation, IEventMainInfo } from '@libs/entities-lib/event';
import { CaseFileStatus, ICaseFileEntity } from '@libs/entities-lib/case-file';

export default Vue.extend({
  props: {
    id: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      caseFiles: null as ICaseFileEntity[],
      /*
      * Events to which the user has access. For most users this access is limited by
      * membership in teams assigned to events. This access cannot be inferred from the
      * data, so there are separate requests for "my" and "all" events.
      */
      myEvents: null as IEventMainInfo[],
      shelterLocations: [] as IEventGenericLocation[],
      otherShelterLocations: [] as IEventGenericLocation[],
    };
  },

  computed: {
    activeCaseFiles():ICaseFileEntity[] {
      return this.caseFiles.filter((c) => c.caseFileStatus === CaseFileStatus.Open || c.caseFileStatus === CaseFileStatus.Inactive);
    },
  },

  methods: {
    async fetchHouseholdCreate(id: string) {
      const householdRes = await this.$storage.household.actions.fetch(id);
      const householdCreateData = await this.buildHouseholdCreateData(householdRes);
      return householdCreateData;
    },

    /**
     * @param {string} [id] Optional. Id of the household for which to fetch the case files.
     * To pass if the method is not called in a component that needs the case files saved in its state, it only needs the data returned from this call.
     * @returns {Promise<ICaseFileEntity[]>} Case files related to a household
     */
    async fetchCaseFiles(id?:string): Promise<ICaseFileEntity[]> {
      const results = await this.$services.caseFiles.getAllCaseFilesRelatedToHouseholdId(id || this.id);
      if (results) {
        // If no argument was passed, the mixin is used with state properties (caseFiles, myEvents), so the payload of this call is saved in the state
        if (!id) {
          this.caseFiles = results;
        }
        return results;
      }
      return null;
    },

    /**
     * @param {string} [caseFiles] Optional. Case files for which to fetch the events to which the user has access.
     * To pass if the method is not called in a component that needs the events saved in its state, it only needs the data returned from this call.
     * @returns {Promise<IEventMainInfo[]>} Case files related to a household
     */
    async fetchMyEvents(caseFiles?: ICaseFileEntity[]): Promise<IEventMainInfo[]> {
      const cf = caseFiles || this.activeCaseFiles;
      if (cf?.length) {
        const eventIds = cf.map((f) => f.eventId);
        const results = await this.$services.events.searchMyEventsById(eventIds);
        if (!caseFiles) {
          this.myEvents = results?.value;
        }
        return results?.value;
      }
      return [];
    },

    async fetchMembersInformation(household: IHouseholdCombined): Promise<IMemberEntity[]> {
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

      members = await this.addShelterLocationData(members);
      return members;
    },

    /**
     * @param {string} [householdId] Optional. Id of the household for which we fetch the shelter locations.
     * To pass if the mixin is not used in a component that stores the case files and myEvents in the state (eg. for household move).
     * @returns {Promise<IEventMainInfo[]>} Shelter location data for the active case files of the household, for events to which the user has access.
     * They are usually fetched to be displayed in the shelter dropdown for the household member's temporary address
     */
    async fetchShelterLocations(householdId?: string): Promise<IEventGenericLocation[]> {
      let events = this.myEvents;
      if (!this.myEvents && householdId) {
        const caseFiles: ICaseFileEntity[] = await this.fetchCaseFiles(householdId);
        const activeCaseFiles = caseFiles.filter((c) => c.caseFileStatus === CaseFileStatus.Open || c.caseFileStatus === CaseFileStatus.Inactive);
        events = await this.fetchMyEvents(activeCaseFiles);
      }

      const shelters = [] as IEventGenericLocation[];
      if (events?.length) {
        events.forEach((e) => {
          if (e.entity.shelterLocations) {
            shelters.push(...e.entity.shelterLocations);
          }
        });
      }
      this.shelterLocations = shelters;
      return shelters;
    },

    async buildHouseholdCreateData(
      household: IHouseholdCombined,
    ): Promise<IHouseholdCreateData> {
      let primaryBeneficiary;
      const additionalMembers = [] as Array<IMemberEntity>;

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

    async addShelterLocationData(members: IMemberEntity[]): Promise<IMemberEntity[]> {
      const mem = await Promise.all(members.map(async (m) => {
        if (m.currentAddress?.shelterLocationId) {
          const shelterLocation = await this.getShelterLocationDatafromId(m.currentAddress?.shelterLocationId);
          return {
            ...m,
            currentAddress: {
              ...m.currentAddress,
              shelterLocation,
            },
          };
        }
        return m;
      }));

      return mem;
    },

    async getShelterLocationDatafromId(shelterLocationId: string): Promise<IEventGenericLocation> {
      const locationFromState = [...this.shelterLocations, ...this.otherShelterLocations].find((l) => l.id === shelterLocationId);
      if (locationFromState) {
        return locationFromState;
      }

      const filter = {
        Entity: {
          ShelterLocations: {
            any: {
              Id: shelterLocationId,
            },
          },
        },
      };

      const events = await this.$services.publicApi.searchEvents({ filter });
      if (events?.value?.length) {
        const event = events?.value[0] as IEventMainInfo;
        const location = event.entity.shelterLocations.find((l) => l.id === shelterLocationId);
        // cache the shelter location data, so that the next member that has the same shelter location id doesn't need to refetch the data
        this.otherShelterLocations.push(location);
        return location;
      }

      return null;
    },
  },

});
