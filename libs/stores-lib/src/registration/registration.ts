import { defineStore } from 'pinia';
import {
  EIndigenousTypes, HouseholdCreate, IHouseholdCreateData, IIndigenousCommunityData, IMember, ISplitHousehold, Member,
} from '@libs/entities-lib/household-create';
import { IInformationFromBeneficiarySearch, IRegistrationMenuItem } from '@libs/registration-lib/src/types';
import Vue, { ref, Ref } from 'vue';
import { IVueI18n, TranslateResult } from 'vue-i18n';
import {
  EOptionItemStatus, ERegistrationMode, IOptionItemData, IServerError,
} from '@libs/shared-lib/types';
import { IEventData as IRegistrationEventData, RegistrationEvent } from '@libs/entities-lib/registration-event';
import { Status } from '@libs/entities-lib/base';
import _sortBy from 'lodash/sortBy';
import _cloneDeep from 'lodash/cloneDeep';
import { IPublicService, IPublicServiceMock } from '@libs/services-lib/public';
import { IHouseholdsService, IHouseholdsServiceMock } from '@libs/services-lib/households/entity';
import { IDetailedRegistrationResponse, IHouseholdEntity } from '@libs/entities-lib/household';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { IRegistrationAssessment } from '@libs/entities-lib/event';
import { IAssessmentFormEntity, PublishStatus } from '@libs/entities-lib/assessment-template';
import {
  additionalMembersValid,
  addressesValid,
  isRegisteredValid,
  personalInformationValid,
  privacyStatementValid, reviewRegistrationValid,
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
}
// eslint-disable-next-line max-lines-per-function
export function storeFactory({
  pTabs, i18n, skipAgeRestriction, skipEmailPhoneRules, mode, publicApi, householdApi,
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
      const newTabs = _cloneDeep(allTabs.value.filter((t) => t.id !== 'assessment'
        || (assessmentToComplete.value?.assessmentForm?.status === Status.Active
          && (mode === ERegistrationMode.CRC || assessmentToComplete.value.assessmentForm.publishStatus === PublishStatus.Published))));
      if (newTabs.find((t) => t.id === 'assessment')) {
        // for self registration the confirmation will not be the last step so we rename the button
        const confTab = newTabs.find((t) => t.id === 'confirmation' && mode === ERegistrationMode.Self);
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
      if (currentTabIndex.value === 0) {
        return 'registration.privacy_statement.start_registration';
      }
      if (getCurrentTab().id === 'confirmation') {
        return '';
      }
      return tabs.value[currentTabIndex.value - 1].titleKey;
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
      for (currentIndex = currentTabIndex; currentIndex.value < targetIndex; currentIndex.value += 1) {
        const currentTabName = tabs.value[currentIndex.value].componentName;

        switch (currentTabName) {
          case 'isRegistered':
            isValid = isRegisteredValid();
            break;
          case 'PrivacyStatement':
          case 'SplitHouseholdEvent':
            isValid = privacyStatementValid({ mode, isPrivacyAgreed: isPrivacyAgreed.value, householdCreate });
            break;
          case 'PersonalInformation':
            isValid = personalInformationValid(householdCreate, skipAgeRestriction, skipEmailPhoneRules);
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
      return currentIndex.value;
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
      for (let index = 0; index < allTabs.value.length; index += 1) {
        mutateTabAtIndex(index, (tab: IRegistrationMenuItem) => {
          tab.disabled = false;
          tab.isValid = true;
          tab.isTouched = false;
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

    async function submitRegistration(recaptchaToken?: string): Promise<IDetailedRegistrationResponse> {
      let result: IDetailedRegistrationResponse;
      submitLoading.value = true;
      try {
        if (mode === ERegistrationMode.Self) {
          result = await householdApi.submitRegistration({
            household: householdCreate.value,
            eventId: event.value.id,
            recaptchaToken,
          });
        } else {
          result = await householdApi.submitCRCRegistration(householdCreate.value, event.value.id);
        }
        registrationResponse.value = result;
        registrationErrors.value = null;
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
    ): Promise<IHouseholdEntity> {
      const result = await householdApi.updatePersonContactInformation(member.id, {
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
    ): Promise<IHouseholdEntity> {
      const result = await householdApi.updatePersonIdentity(member.id, {
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
    ): Promise<IHouseholdEntity> {
      let result;
      if (isPrimaryMember) {
        result = await householdApi.updatePersonAddress(member.id, member.currentAddress);
        if (result) {
          householdCreate.value.setCurrentAddress(member.currentAddress);
        }
      } else if (index >= 0) {
        let address = { ...member.currentAddress };
        if (sameAddress) {
          address = householdCreate.value.primaryBeneficiary.currentAddress;
        }
        result = await householdApi.updatePersonAddress(member.id, address);
        if (result) {
          householdCreate.value.editAdditionalMember(member, index, sameAddress);
        }
      }
      return result || null;
    }

    async function addAdditionalMember({ householdId, member, sameAddress = false }: { householdId: string; member: IMember; sameAddress?: boolean }): Promise<IHouseholdEntity> {
      if (sameAddress) {
        member.currentAddress = { ...householdCreate.value.primaryBeneficiary.currentAddress };
      }
      const res = await householdApi.addMember(householdId, member);
      if (res) {
        const newMember = new Member({ ...member, id: res.members[res.members.length - 1] });
        householdCreate.value.addAdditionalMember(newMember, sameAddress);
      }
      return res;
    }

    async function deleteAdditionalMember({ householdId, memberId, index }: { householdId: string; memberId: string; index: number }): Promise<IHouseholdEntity> {
      const res = await householdApi.deleteAdditionalMember(householdId, memberId);
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

    return {
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
      fetchEvent,
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
    };
  })();
}
