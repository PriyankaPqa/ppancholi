import { defineStore } from 'pinia';
import {
  EIndigenousTypes, HouseholdCreate, IAddressData, ICheckForPossibleDuplicateResponse, IHouseholdCreateData,
  IIdentitySet, IIndigenousCommunityData, IMember, IMemberEntity, ISplitHousehold, Member,
} from '@libs/entities-lib/household-create';
import { IInformationFromBeneficiarySearch } from '@libs/registration-lib/src/types';
import { IRegistrationMenuItem, TabId } from '@libs/registration-lib/types/interfaces/IRegistrationMenuItem';
import Vue, { ref, Ref } from 'vue';
import { IVueI18n, TranslateResult } from 'vue-i18n';
import {
  EOptionItemStatus, ERegistrationMode, IOptionItemData, IServerError, IdentityAuthenticationStatus,
} from '@libs/shared-lib/types';
import { IEventData, IEventData as IRegistrationEventData, RegistrationEvent } from '@libs/entities-lib/registration-event';
import { Status } from '@libs/entities-lib/base';
import _sortBy from 'lodash/sortBy';
import _cloneDeep from 'lodash/cloneDeep';
import deepmerge from 'deepmerge';
import { IPublicService, IPublicServiceMock } from '@libs/services-lib/public';
import { IHouseholdsService, IHouseholdsServiceMock } from '@libs/services-lib/households/entity';
import { IDetailedRegistrationResponse, IHouseholdEntity } from '@libs/entities-lib/household';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { IEventGenericLocation, IRegistrationAssessment } from '@libs/entities-lib/event';
import libHelpers from '@libs/entities-lib/helpers';
import { IAssessmentFormEntity, PublishStatus } from '@libs/entities-lib/assessment-template';
import { ICaseFilesService, ICaseFilesServiceMock } from '@libs/services-lib/case-files/entity';
import { ITier2Details } from '@libs/entities-lib/src/case-file';
import {
  additionalMembersValid,
  addressesValid,
  isRegisteredValid,
  keysForDuplicateErrors,
  personalInformationValid,
  privacyStatementValid,
  reviewRegistrationValid,
} from './registrationUtils';

/**
 *  TODO Need to understand how to properly define a store with typescript or find out why types are lost when components coming from a method.
 *  Until then we partially type the store with method we defined, but methods coming from Pinia won't be available https://github.com/vuejs/pinia/discussions/1924
 */

export interface IRegistrationParams {
  pTabs: IRegistrationMenuItem[]
  i18n: IVueI18n,
  skipAgeRestriction: boolean
  skipEmailPhoneRules: boolean
  mode: ERegistrationMode
  publicApi: IPublicService | IPublicServiceMock,
  householdApi: IHouseholdsService | IHouseholdsServiceMock,
  caseFileApi: ICaseFilesService | ICaseFilesServiceMock,
  testMode?: boolean,
  mockedInternalMethods?: {},
}
// eslint-disable-next-line max-lines-per-function
export function storeFactory({
  pTabs, i18n, skipAgeRestriction, skipEmailPhoneRules, mode, publicApi, householdApi, caseFileApi, testMode, mockedInternalMethods,
}: IRegistrationParams) {
  // eslint-disable-next-line max-lines-per-function, max-statements
  return defineStore('registration', () => {
    const isPrivacyAgreed = ref(false);
    const event = ref(null) as Ref<IRegistrationEventData>;
    const isLeftMenuOpen = ref(true);
    const tabs = ref(pTabs) as Ref<IRegistrationMenuItem[]>;
    const currentTabIndex = ref(0);
    const genders = ref([]);
    const gendersFetched = ref(false);
    const preferredLanguages = ref([]);
    const primarySpokenLanguages = ref([]);
    const indigenousCommunities = ref([]);
    const primarySpokenLanguagesFetched = ref(false);
    const loadingIndigenousCommunities = ref(false);
    const registrationResponse = ref(null) as Ref<IDetailedRegistrationResponse>;
    const registrationErrors = ref(null) as Ref<IServerError>;
    const submitLoading = ref(false);
    const inlineEditCounter = ref(0);
    const householdResultsShown = ref(false);
    const householdCreate = ref(new HouseholdCreate());
    const householdAssociationMode = ref(false);
    const householdAlreadyRegistered = ref(false);
    const splitHouseholdState = ref(null) as Ref<ISplitHousehold>;
    const informationFromBeneficiarySearch = ref({}) as Ref<IInformationFromBeneficiarySearch>;
    const assessmentToComplete = ref(null) as Ref<{ registrationAssessment: IRegistrationAssessment, assessmentForm: IAssessmentFormEntity }>;
    const allTabs = ref(_cloneDeep(pTabs)) as Ref<IRegistrationMenuItem[]>;
    const duplicateResult = ref(null) as Ref<ICheckForPossibleDuplicateResponse>;
    const tier2State = ref({ mustDoTier2: null, completed: false }) as
      Ref<{ mustDoTier2: boolean, completed: boolean, basicDocumentsOnly?: boolean, status: IdentityAuthenticationStatus }>;
    const basicInformationWhenTier2FromEmail = ref(null) as Ref<ITier2Details>;
    const storeShelterLocations = ref([]);

    function isDuplicateError(): boolean {
      if (duplicateResult.value?.duplicateFound && (duplicateResult.value.registeredToEvent || (!duplicateResult.value.maskedAlternatePhoneNumber
        && !duplicateResult.value.maskedEmail && !duplicateResult.value.maskedHomePhone && !duplicateResult.value.maskedMobilePhone))) {
        return true;
      }
      const errors = registrationErrors.value?.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        return errors.some((e) => keysForDuplicateErrors.includes(e.code));
      }
      return false;
    }
    function containsErrorCode(): boolean {
      const errors = registrationErrors.value?.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        return errors.some((e) => e.code.length !== 0);
      }
      return false;
    }

    const internalMethods = {
      parseIdentitySet(member: IMemberEntity, indigenousCommunities: IIndigenousCommunityData[], genderItems: IOptionItemData[]) {
        const indigenous = member.identitySet?.indigenousIdentity?.indigenousCommunityId
          ? indigenousCommunities.find((c) => c.id === member.identitySet.indigenousIdentity.indigenousCommunityId) : null;

        return {
          birthDate: libHelpers.convertBirthDateStringToObject(member.identitySet.dateOfBirth),
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

      async getShelterLocationDatafromId(
        shelterLocationId: string,
        shelterLocations: IEventGenericLocation[],
      ): Promise<IEventGenericLocation> {
        const locationFromParameters = [...shelterLocations, ...storeShelterLocations.value].find((l) => l.id === shelterLocationId);
        if (locationFromParameters) {
          return locationFromParameters;
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

        const events = await publicApi.searchEvents({ filter });
        if (events?.value?.length) {
          const event = events?.value[0].entity as IEventData;
          const location = event.shelterLocations.find((l) => l.id === shelterLocationId);
          // cache the shelter location data, so that the next member that has the same shelter location id doesn't need to refetch the data
          storeShelterLocations.value.push(location);
          return location;
        }

        return null;
      },

      async addShelterLocationData(members: IMemberEntity[], shelterLocations: IEventGenericLocation[] = []): Promise<IMemberEntity[]> {
        const parsedMembers = [] as unknown as IMemberEntity[];

        for (const m of members) {
          if (m) {
            // eslint-disable-next-line no-await-in-loop
            const newAddressHistory = await Promise.all(m.addressHistory.map(async (a) => {
              if (a.shelterLocationId) {
                const shelterLocation = await this.getShelterLocationDatafromId(a.shelterLocationId, shelterLocations);
                return {
                  ...a,
                  shelterLocation,
                };
              }
              return {
                ...a,
                shelterLocation: null,
              };
            }));

            let parsedHistoryMember = {
              ...m,
              addressHistory: newAddressHistory,
              currentAddress: m.currentAddress,
            };

            if (parsedHistoryMember.currentAddress?.shelterLocationId) {
              // eslint-disable-next-line no-await-in-loop
              const shelterLocation = await this.getShelterLocationDatafromId(m.currentAddress?.shelterLocationId, shelterLocations);

              parsedHistoryMember = {
                ...parsedHistoryMember,
                currentAddress: {
                  ...parsedHistoryMember.currentAddress,
                  shelterLocation,
                },
              };
            }

            parsedMembers.push(parsedHistoryMember);
          }
        }
        return parsedMembers;
      },

      async fetchMembersInformation(household: IHouseholdEntity, shelterLocations: IEventGenericLocation[]): Promise<IMemberEntity[]> {
        let primaryBeneficiaryPromise;
        const additionalMembersPromises = [] as Array<Promise<IMemberEntity>>;

        household.members.forEach((id) => {
          const promise = (mode === ERegistrationMode.CRC ? householdApi.getPerson(id) : householdApi.publicGetPerson(id)) as Promise<IMemberEntity>;

          if (id === household.primaryBeneficiary) {
            primaryBeneficiaryPromise = promise;
          } else {
            additionalMembersPromises.push(promise);
          }
        });

        let members: IMemberEntity[] = await Promise.all([primaryBeneficiaryPromise, ...additionalMembersPromises]);

        members = await this.addShelterLocationData(members, shelterLocations);
        return members;
      },

      ...(mockedInternalMethods || {}),
    };

    function getAssessmentToComplete() {
      return _cloneDeep(assessmentToComplete.value);
    }

    function setTabs(pTabs: IRegistrationMenuItem[]) {
      tabs.value = pTabs;
      allTabs.value = _cloneDeep(pTabs);
    }

    function setAssessmentToComplete(payload: { registrationAssessment: IRegistrationAssessment, assessmentForm: IAssessmentFormEntity }) {
      assessmentToComplete.value = payload;

      if (assessmentToComplete.value?.assessmentForm?.status !== Status.Active) {
        assessmentToComplete.value = null;
      }

      // we keep the Assessment tab only if we have an assessment that can be completed
      // rules say that it must be active and published to be visible to self-registration
      // but can be unpublished if CRC is doing the registration
      const newTabs = _cloneDeep(allTabs.value.filter((t) => t.id !== TabId.Assessment
        || (assessmentToComplete.value?.assessmentForm?.status === Status.Active
          && (mode === ERegistrationMode.CRC || assessmentToComplete.value.assessmentForm.publishStatus === PublishStatus.Published))));
      if (newTabs.find((t) => t.id === TabId.Assessment)) {
        // for self registration the confirmation will not be the last step so we rename the button
        const confTab = newTabs.find((t) => t.id === TabId.Confirmation && mode === ERegistrationMode.Self);
        if (confTab) {
          confTab.nextButtonTextKey = 'common.button.next';
        }
      }
      tabs.value = newTabs;
    }

    function isCRCRegistration() {
      return mode === ERegistrationMode.CRC;
    }
    function getEvent() {
      return new RegistrationEvent(event.value);
    }
    function getCurrentTab() {
      return tabs.value[currentTabIndex.value];
    }
    function getPreviousTabName() {
      if (currentTabIndex.value === 0 && getCurrentTab().id !== TabId.Confirmation) {
        return 'registration.privacy_statement.start_registration';
      }

      const nonDisabledTabs = tabs.value.filter((t, index) => index < currentTabIndex.value && !t.disabled);
      return nonDisabledTabs.length ? nonDisabledTabs[nonDisabledTabs.length - 1].titleKey : null;
    }
    function getNextTabName() {
      if (currentTabIndex.value >= tabs.value.length - 2) {
        return '';
      }
      return tabs.value[currentTabIndex.value + 1].titleKey;
    }
    function getGenders(includeInactive = false) {
      let returnGenders = genders.value;
      if (!includeInactive) {
        returnGenders = genders.value.filter((g) => g.status === Status.Active);
      }
      return _sortBy(returnGenders, 'orderRank');
    }
    function getPreferredLanguages() {
      return _sortBy(preferredLanguages.value, 'orderRank');
    }
    function getPrimarySpokenLanguages(includeInactive = false) {
      let res = primarySpokenLanguages.value;
      if (!includeInactive) {
        res = primarySpokenLanguages.value.filter((g) => g.status === Status.Active);
      }
      return _sortBy(res, 'orderRank');
    }
    function getIndigenousTypesItems(): Record<string, TranslateResult>[] {
      const communities = indigenousCommunities.value;
      if (communities) {
        const a = [...new Set(communities.map((community) => community.communityType))]
          .map((typeNumber: number) => {
            const indigenousType: string = EIndigenousTypes[typeNumber];
            return {
              value: typeNumber,
              text: i18n.t(`common.indigenous.types.${indigenousType}`),
            };
          });
        return _sortBy(a, 'text') as unknown as Record<string, TranslateResult>[];
      }
      return [];
    }
    function getIndigenousCommunitiesItems(indigenousType: EIndigenousTypes): Record<string, string>[] {
      const commmunities = indigenousCommunities.value;
      if (commmunities) {
        let items = commmunities.filter((i: IIndigenousCommunityData) => i.communityType === indigenousType);
        let otherCommunity = null as IIndigenousCommunityData;

        otherCommunity = items.find((i: IIndigenousCommunityData) => i.communityName === 'Other');
        items = items.filter((i: IIndigenousCommunityData) => i.id !== otherCommunity?.id);

        const mapItems = items.map((i: IIndigenousCommunityData) => ({
          value: i.id,
          text: i.communityName,
        }));

        const sortedCommunities = _sortBy(mapItems, 'text');

        if (otherCommunity) {
          return [{ value: otherCommunity.id, text: i18n.locale === 'fr' ? 'Autre' : 'Other' }, ...sortedCommunities];
        }
        return sortedCommunities;
      }
      return [];
    }
    function getHouseholdCreate() {
      return _cloneDeep(householdCreate.value);
    }

    function isSplitMode() {
      return !!(splitHouseholdState.value);
    }

    function findEffectiveJumpIndex(targetIndex: number): number {
      if (targetIndex <= currentTabIndex.value) {
        return targetIndex;
      }
      let isValid: boolean;
      let currentIndex;
      const householdCreate = getHouseholdCreate();
      // For each step between where we are and where we're jumping to
      for (currentIndex = currentTabIndex.value; currentIndex < targetIndex; currentIndex += 1) {
        const currentTabName = tabs.value[currentIndex].componentName;

        switch (currentTabName) {
          case 'isRegistered':
            isValid = isRegisteredValid();
            break;
          case 'PrivacyStatement':
          case 'SplitHouseholdEvent':
            isValid = privacyStatementValid({ mode, isPrivacyAgreed: isPrivacyAgreed.value, householdCreate });
            break;
          case 'PersonalInformation':
            isValid = personalInformationValid(householdCreate, skipAgeRestriction, skipEmailPhoneRules, isCRCRegistration());
            break;
          case 'Addresses':
            isValid = addressesValid(householdCreate, householdCreate.noFixedHome);
            break;
          case 'AdditionalMembers':
            isValid = additionalMembersValid(householdCreate);
            break;
          case 'ReviewRegistration':
            isValid = reviewRegistrationValid();
            break;
          case 'SplitHouseholdMembers':
          case 'ReviewSplit':
            isValid = true;
            break;
          case 'ConfirmRegistration':
          default:
            isValid = true;
            break;
        }
        // Return on first error found
        if (!isValid) {
          break;
        }
      }
      return currentIndex;
    }
    function mutateCurrentTab(callback: (targetTab: IRegistrationMenuItem) => void) {
      const targetTab = getCurrentTab();
      callback(targetTab);
    }
    function mutateTabAtIndex(targetIndex: number, callback: (targetTab: IRegistrationMenuItem) => void) {
      const targetTab = tabs.value[targetIndex];
      callback(targetTab);
    }
    function jump(toIndex: number): void {
      const currentIndex = currentTabIndex.value;
      if (toIndex === currentIndex || toIndex < 0 || toIndex >= tabs.value.length) {
        return;
      }

      Vue.set(tabs.value[currentIndex], 'isTouched', true);

      currentTabIndex.value = toIndex;
    }
    function increaseInlineEditCounter() {
      inlineEditCounter.value += 1;
    }
    function decreaseInlineEditCounter() {
      if (inlineEditCounter.value >= 1) {
        inlineEditCounter.value -= 1;
      }
    }
    function setHouseholdCreate(payload: IHouseholdCreateData) {
      householdCreate.value = new HouseholdCreate(payload);
    }
    function resetHouseholdCreate() {
      householdCreate.value = new HouseholdCreate();
      registrationErrors.value = null;
    }
    function resetTabs() {
      for (let index = 0; index < tabs.value.length; index += 1) {
        const originalTab = allTabs.value.find((t) => t.id === tabs.value[index].id);
        mutateTabAtIndex(index, (tab: IRegistrationMenuItem) => {
          tab.disabled = originalTab.disabled;
          tab.isValid = originalTab.isValid;
          tab.isTouched = originalTab.isTouched;
        });
      }
    }
    function setSplitHousehold({ originHouseholdId, primaryMember, additionalMembers }: { originHouseholdId: string; primaryMember: IMember; additionalMembers: IMember[] }) {
      splitHouseholdState.value = { originHouseholdId, splitMembers: { primaryMember, additionalMembers } };
    }
    function resetSplitHousehold() {
      splitHouseholdState.value = null;
      event.value = null;
      registrationErrors.value = null;
      registrationResponse.value = null;
      currentTabIndex.value = 0;
      isPrivacyAgreed.value = false;
      householdResultsShown.value = false;
    }

    async function checkDuplicates({ form, isPrimaryMember, index = -1, preventDbCheck = false, memberId = '' }
      :{ form:IIdentitySet, isPrimaryMember: boolean, index?: number, preventDbCheck?:boolean, memberId?:string }) {
      const dateOfBirth = form?.birthDate && libHelpers.getBirthDateUTCString(form.birthDate);
      if (!form.firstName || !form.lastName || !dateOfBirth) {
        return false;
      }

      const isDuplicateInCurrentHousehold = householdCreate.value.isDuplicateMember({ ...form, dateOfBirth }, isPrimaryMember, index, memberId);

      form.setDuplicateStatusInCurrentHousehold(isDuplicateInCurrentHousehold);
      if (isPrimaryMember) {
        householdCreate.value.primaryBeneficiary.identitySet.setDuplicateStatusInCurrentHousehold(isDuplicateInCurrentHousehold);
      } else {
        householdCreate.value.additionalMembers[index]?.identitySet.setDuplicateStatusInCurrentHousehold(isDuplicateInCurrentHousehold);
      }

      if (isDuplicateInCurrentHousehold) {
        return true;
      }

      if (!preventDbCheck) {
        const member = new Member();
        member.setIdentity({ ...form, dateOfBirth });
        const checkDuplicateResult = await householdApi.checkForPossibleDuplicatePublic(null, member, householdCreate.value.id);
        if (checkDuplicateResult) {
          const systemDuplicateFound = checkDuplicateResult.duplicateFound;
          form.setDuplicateStatusInDb(systemDuplicateFound);
          if (isPrimaryMember) {
            householdCreate.value.primaryBeneficiary.identitySet.setDuplicateStatusInDb(systemDuplicateFound);
          } else {
            householdCreate.value.additionalMembers[index]?.identitySet.setDuplicateStatusInDb(systemDuplicateFound);
          }
          return systemDuplicateFound;
        }
      }

      return false;
    }

    async function fetchEvent(lang: string, registrationLink: string) {
      const result = await publicApi.fetchRegistrationEvent(lang, registrationLink);
      const eventData = result?.value?.length > 0 ? result.value[0].entity : null;
      event.value = eventData;
      return getEvent();
    }

    async function fetchGenders(): Promise<IOptionItemData[]> {
      if (!gendersFetched.value) {
        const data: IOptionItemData[] = await householdApi.getGenders();

        if (data?.length > 0) {
          genders.value = data;
          gendersFetched.value = true;
        }
      }
      return getGenders(false);
    }

    async function fetchPreferredLanguages(): Promise<(IOptionItemData & { languageCode: string })[]> {
      if (preferredLanguages.value.length === 0) {
        const data: IOptionItemData[] = await householdApi.getPreferredLanguages();
        if (data?.length > 0) {
          preferredLanguages.value = data.filter((entry) => entry.status === EOptionItemStatus.Active);
        }
      }
      return getPreferredLanguages();
    }

    async function fetchPrimarySpokenLanguages(): Promise<IOptionItemData[]> {
      if (!primarySpokenLanguagesFetched.value) {
        const data: IOptionItemData[] = await householdApi.getPrimarySpokenLanguages();
        if (data?.length > 0) {
          primarySpokenLanguages.value = data;
          primarySpokenLanguagesFetched.value = true;
        }
      }
      return getPrimarySpokenLanguages();
    }

    async function fetchIndigenousCommunities(): Promise<IIndigenousCommunityData[]> {
      let communities = indigenousCommunities.value;
      if (communities.length === 0) {
        loadingIndigenousCommunities.value = true;
        try {
          const result = await householdApi.getIndigenousCommunities();
          if (result?.length > 0) {
            communities = result.filter((entry: IIndigenousCommunityData) => entry.status === EOptionItemStatus.Active);
          }
        } finally {
          indigenousCommunities.value = communities;
          loadingIndigenousCommunities.value = false;
        }
      }
      return communities;
    }

    function tier2Tab() : IRegistrationMenuItem {
      return {
        id: TabId.Tier2auth,
        labelKey: 'registration.menu.identity_authentication',
        titleKey: 'registration.page.identity_authentication',
        icon: 'mdi-account-box',
        disabled: false,
        isValid: true,
        isTouched: false,
        backButtonTextKey: 'registration.button.skip_authentication',
        nextButtonTextKey: 'registration.button.authenticate',
        componentName: 'Tier2Selection',
        helpLink: '',
      };
    }

    async function submitRegistration(): Promise<IDetailedRegistrationResponse> {
      let result: IDetailedRegistrationResponse;
      submitLoading.value = true;
      try {
        if (mode === ERegistrationMode.Self) {
          if (householdCreate.value.id) {
            result = await caseFileApi.createCaseFile({
              householdId: householdCreate.value.id,
              eventId: event.value.id,
              consentInformation: householdCreate.value.consentInformation,
            }, true);
          } else {
            result = await householdApi.submitRegistration({
              household: householdCreate.value,
              eventId: event.value.id,
            });
          }
        } else {
          result = await householdApi.submitCRCRegistration(householdCreate.value, event.value.id);
        }
        registrationResponse.value = result;
        registrationErrors.value = null;

        tier2State.value.mustDoTier2 = result?.mustDoTier2authentication;

        // BE will decide whether a tier 2 authentication should occur - if so a tab is inserted
        if (result?.mustDoTier2authentication) {
          tabs.value.splice(currentTabIndex.value + 1, 0, tier2Tab());
        }
      } catch (error) {
        const e = (error as IServerError).response?.data?.errors || error;
        applicationInsights.trackTrace(`submitRegistration error - self: ${mode === ERegistrationMode.Self}`, { error: e }, 'store.registration', 'submitRegistration');
        registrationErrors.value = error as IServerError;
      } finally {
        submitLoading.value = false;
      }
      return result;
    }

    async function updatePersonContactInformation(
      { member, isPrimaryMember, index = -1 }: { member: IMember; isPrimaryMember: boolean; index?: number },
    ): Promise<IMemberEntity> {
      const result = await householdApi.updatePersonContactInformation(member.id, mode === ERegistrationMode.Self, {
        contactInformation: member.contactInformation,
        identitySet: member.identitySet,
        isPrimaryBeneficiary: isPrimaryMember,
      });

      if (result) {
        if (isPrimaryMember) {
          householdCreate.value.primaryBeneficiary.setPersonalInformation(member.contactInformation, member.identitySet);
        } else if (index >= 0) {
          householdCreate.value.editAdditionalMember(member, index, false);
        }
      }
      return result || null;
    }

    async function updatePersonIdentity(
      { member, isPrimaryMember, index = -1 }: { member: IMember; isPrimaryMember: boolean; index?: number },
    ): Promise<IMemberEntity> {
      const result = await householdApi.updatePersonIdentity(member.id, mode === ERegistrationMode.Self, {
        contactInformation: member.contactInformation,
        identitySet: member.identitySet,
      });

      if (result) {
        if (isPrimaryMember) {
          householdCreate.value.primaryBeneficiary.setPersonalInformation(member.contactInformation, member.identitySet);
        } else if (index >= 0) {
          householdCreate.value.editAdditionalMember(member, index, false);
        }
      }

      return result || null;
    }

    async function updatePersonAddress(
      {
        member, isPrimaryMember, index = -1, sameAddress = false,
      }: { member: IMember; isPrimaryMember: boolean; index?: number; sameAddress?: boolean },
    ): Promise<IMemberEntity> {
      let result;
      if (isPrimaryMember) {
        result = await householdApi.updatePersonAddress(member.id, mode === ERegistrationMode.Self, member.currentAddress);
        if (result) {
          const addShelterLocationData = await internalMethods.addShelterLocationData([result]);
          const memberWithUpdatedShelterLocation = addShelterLocationData?.[0];
          householdCreate.value.setPrimaryBeneficiary(new Member(memberWithUpdatedShelterLocation));
        }
      } else if (index >= 0) {
        let address = { ...member.currentAddress };
        if (sameAddress) {
          address = householdCreate.value.primaryBeneficiary.currentAddress;
        }
        result = await householdApi.updatePersonAddress(member.id, mode === ERegistrationMode.Self, address);
        if (result) {
          const addShelterLocationData = await internalMethods.addShelterLocationData([result]);
          const memberWithUpdatedShelterLocation = addShelterLocationData?.[0];
          householdCreate.value.editAdditionalMember(new Member(memberWithUpdatedShelterLocation), index, sameAddress);
        }
      }
      return result || null;
    }

    async function addAdditionalMember({ householdId, member, sameAddress = false }: { householdId: string; member: IMember; sameAddress?: boolean }): Promise<IHouseholdEntity> {
      if (sameAddress) {
        member.currentAddress = { ...householdCreate.value.primaryBeneficiary.currentAddress };
      }
      const res = await householdApi.addMember(householdId, mode === ERegistrationMode.Self, member);
      if (res) {
        const newMember = new Member({ ...member, id: res.members[res.members.length - 1] });
        householdCreate.value.addAdditionalMember(newMember, sameAddress);
      }
      return res;
    }

    async function deleteAdditionalMember({ householdId, memberId, index }: { householdId: string; memberId: string; index: number }): Promise<IHouseholdEntity> {
      const res = await householdApi.deleteAdditionalMember(householdId, mode === ERegistrationMode.Self, memberId);
      if (res) {
        householdCreate.value.removeAdditionalMember(index);
      }
      return res;
    }

    async function splitHousehold(): Promise<IDetailedRegistrationResponse> {
      let result: IDetailedRegistrationResponse;
      submitLoading.value = true;
      try {
        const originHouseholdId = splitHouseholdState.value.originHouseholdId;
        result = await householdApi.splitHousehold(householdCreate.value, originHouseholdId, event.value.id);
        registrationResponse.value = result;
      } catch (e) {
        applicationInsights.trackTrace('splitHousehold error', { error: e }, 'store.registration', 'splitHousehold');
        registrationErrors.value = e as IServerError;
      } finally {
        submitLoading.value = false;
      }
      return result;
    }

    async function buildHouseholdCreateData(household: IHouseholdEntity, shelterLocations?: IEventGenericLocation[]): Promise<IHouseholdCreateData> {
      let primaryBeneficiary;
      const additionalMembers = [] as Array<IMemberEntity>;

      let genderItems = getGenders(true) as IOptionItemData[];
      if (genderItems.length === 0) {
        genderItems = await fetchGenders() as IOptionItemData[];
      }

      let preferredLanguagesItems = getPreferredLanguages() as IOptionItemData[];
      if (preferredLanguagesItems.length === 0) {
        preferredLanguagesItems = await fetchPreferredLanguages() as IOptionItemData[];
      }

      let primarySpokenLanguagesItems = getPrimarySpokenLanguages(true) as IOptionItemData[];
      if (primarySpokenLanguagesItems.length === 0) {
        primarySpokenLanguagesItems = await fetchPrimarySpokenLanguages() as IOptionItemData[];
      }

      const members = await internalMethods.fetchMembersInformation(household, shelterLocations || event.value?.shelterLocations);

      const communitiesItems = await fetchIndigenousCommunities();

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

      if (members) {
        members.forEach((m, index) => {
          const currentAddress = {
            ...m.currentAddress,
            address: !m.currentAddress || m.currentAddress.address === null ? emptyCurrentAddress : m.currentAddress.address,
          };

          const member = deepmerge(m, {
            identitySet: internalMethods.parseIdentitySet(m, communitiesItems, genderItems),
            contactInformation: internalMethods.parseContactInformation(m, preferredLanguagesItems, primarySpokenLanguagesItems),
            currentAddress,
          });

          if (index === 0) {
            primaryBeneficiary = member;
          } else {
            additionalMembers.push(member);
          }
        });
      }

      return {
        id: household.id,
        registrationNumber: household.registrationNumber,
        consentInformation: {
          crcUserName: '',
          registrationLocationId: '',
          registrationMethod: null,
          privacyDateTimeConsent: '',
        },
        primaryBeneficiary,
        homeAddress: household.address?.address,
        additionalMembers,
        noFixedHome: household.address?.address === null,
      };
    }

    async function loadHousehold(householdId: string): Promise<HouseholdCreate> {
      try {
        const consentInformation = householdCreate.value.consentInformation;
        const household = mode === ERegistrationMode.CRC ? await householdApi.get(householdId) : await householdApi.publicGetHousehold(householdId);
        setHouseholdCreate(await buildHouseholdCreateData(household));
        householdCreate.value.primaryBeneficiary.contactInformation.emailValidatedByBackend = true;
        householdCreate.value.consentInformation = consentInformation;
        return householdCreate.value;
      } catch (e) {
        applicationInsights.trackTrace('loadHousehold error', { error: e }, 'store.registration', 'loadHousehold');
        registrationErrors.value = e as IServerError;
      }
      return null;
    }

    async function fetchDetailsForTier2Process(caseFileId: uuid) {
      const result = await caseFileApi.getTier2Details(caseFileId);
      const eventData = result?.event;
      event.value = eventData;
      tier2State.value = {
        status: result?.tier2response?.identityAuthenticationStatus,
        completed: result?.tier2response?.processCompleted,
        mustDoTier2: result?.canCompleteTier2,
      };
      basicInformationWhenTier2FromEmail.value = result;

      if (result?.canCompleteTier2) {
        tabs.value = [tier2Tab(), allTabs.value.find((t) => t.id === TabId.Confirmation)];
      } else {
        registrationErrors.value = { response: { data: { errors: [{ code: 'errors.cannotcompletetier2' }] } } } as IServerError;
        tabs.value = [allTabs.value.find((t) => t.id === TabId.Confirmation)];
      }

      return result;
    }

    return {
      basicInformationWhenTier2FromEmail,
      duplicateResult,
      tier2State,
      isDuplicateError,
      containsErrorCode,
      isPrivacyAgreed,
      event,
      isLeftMenuOpen,
      tabs,
      currentTabIndex,
      genders,
      gendersFetched,
      preferredLanguages,
      primarySpokenLanguages,
      primarySpokenLanguagesFetched,
      indigenousCommunities,
      loadingIndigenousCommunities,
      registrationResponse,
      registrationErrors,
      submitLoading,
      inlineEditCounter,
      householdResultsShown,
      householdCreate,
      householdAssociationMode,
      householdAlreadyRegistered,
      splitHouseholdState,
      informationFromBeneficiarySearch,
      isCRCRegistration,
      getEvent,
      getCurrentTab,
      getPreviousTabName,
      getNextTabName,
      getGenders,
      getPreferredLanguages,
      getPrimarySpokenLanguages,
      getIndigenousTypesItems,
      getIndigenousCommunitiesItems,
      getHouseholdCreate,
      isSplitMode,
      findEffectiveJumpIndex,
      mutateCurrentTab,
      mutateTabAtIndex,
      jump,
      increaseInlineEditCounter,
      decreaseInlineEditCounter,
      setHouseholdCreate,
      resetHouseholdCreate,
      resetTabs,
      setSplitHousehold,
      resetSplitHousehold,
      checkDuplicates,
      fetchEvent,
      fetchDetailsForTier2Process,
      fetchGenders,
      fetchPreferredLanguages,
      fetchPrimarySpokenLanguages,
      fetchIndigenousCommunities,
      submitRegistration,
      updatePersonContactInformation,
      updatePersonIdentity,
      updatePersonAddress,
      addAdditionalMember,
      deleteAdditionalMember,
      splitHousehold,
      assessmentToComplete,
      getAssessmentToComplete,
      setAssessmentToComplete,
      allTabs,
      setTabs,
      loadHousehold,
      buildHouseholdCreateData,
      internalMethods: testMode ? internalMethods : null,
      storeShelterLocations,
    };
  })();
}
