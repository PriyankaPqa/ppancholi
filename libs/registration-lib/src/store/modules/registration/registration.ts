import {
  IServerError, ERegistrationMode,
  EOptionItemStatus, ERegistrationMethod, IOptionItemData,
} from '@libs/shared-lib/types';
/* eslint-disable max-lines-per-function */
import {
  ActionContext, ActionTree, GetterTree, Module, MutationTree,
} from 'vuex';
import _sortBy from 'lodash/sortBy';
import VueI18n from 'vue-i18n';
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import _isEqual from 'lodash/isEqual';
import { Status } from '@libs/entities-lib/base';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { ISplitHousehold } from '@libs/entities-lib/household-create/householdCreate.types';
import { PublishStatus } from '@libs/entities-lib/assessment-template';
import { IDetailedRegistrationResponse, IHouseholdEntity } from '@libs/entities-lib/household';
import {
  HouseholdCreate,
  EIndigenousTypes,
  IHouseholdCreate,
  IIndigenousCommunityData,
  IContactInformation,
  IdentitySet,
  ContactInformation,
  IMember,
  Member,
  IIdentitySetData,
  ICurrentAddress, IAddress, IHouseholdCreateData,
} from '@libs/entities-lib/household-create';
import { RegistrationEvent, IEvent, IEventData } from '@libs/entities-lib/registration-event';
import { IRegistrationAssessment } from '@libs/entities-lib/src/event';
import { IAssessmentFormEntity } from '@libs/entities-lib/src/assessment-template';
import { IRegistrationMenuItem, IInformationFromBeneficiarySearch } from '../../../types';
import {
  isRegisteredValid,
  privacyStatementValid,
  personalInformationValid,
  addressesValid,
  additionalMembersValid,
  reviewRegistrationValid,
} from './registrationUtils';
import { IRootState, IStore } from '../../store.types';

import { resetVuexModuleState } from '../../storeUtils';

import { IState } from './registration.types';

export const getDefaultState = (tabs: IRegistrationMenuItem[]): IState => ({
  isPrivacyAgreed: false,
  event: null,
  isLeftMenuOpen: true,
  allTabs: tabs,
  tabs,
  currentTabIndex: 0,
  genders: [],
  preferredLanguages: [],
  primarySpokenLanguages: [],
  indigenousCommunities: [],
  loadingIndigenousCommunities: false,
  registrationResponse: null,
  registrationErrors: null,
  submitLoading: false,
  inlineEditCounter: 0,
  householdResultsShown: false,
  householdCreate: new HouseholdCreate(),
  householdAssociationMode: false,
  householdAlreadyRegistered: false,
  splitHousehold: null as ISplitHousehold,
  primarySpokenLanguagesFetched: false,
  gendersFetched: false,
  assessmentToComplete: null,
  informationFromBeneficiarySearch: {} as IInformationFromBeneficiarySearch,
});

const moduleState = (tabs: IRegistrationMenuItem[]): IState => getDefaultState(tabs);

const getters = (i18n: VueI18n, skipAgeRestriction: boolean, skipEmailPhoneRules: boolean, mode: ERegistrationMode) => ({
  isCRCRegistration: () => mode === ERegistrationMode.CRC,

  event: (state: IState) => new RegistrationEvent(state.event),

  assessmentToComplete: (state: IState) => _cloneDeep(state.assessmentToComplete),

  isLeftMenuOpen: (state: IState) => state.isLeftMenuOpen,

  tabs: (state: IState) => state.tabs,

  currentTabIndex: (state: IState) => state.currentTabIndex,

  currentTab: (state: IState) => state.tabs[state.currentTabIndex],

  previousTabName: (state: IState) => {
    if (state.currentTabIndex === 0) {
      return 'registration.privacy_statement.start_registration';
    }

    if (state.tabs[state.currentTabIndex].id === 'confirmation') {
      return '';
    }

    return state.tabs[state.currentTabIndex - 1].titleKey;
  },

  nextTabName: (state: IState) => {
    if (state.currentTabIndex >= state.tabs.length - 2) {
      return '';
    }
    return state.tabs[state.currentTabIndex + 1].titleKey;
  },

  genders: (state: IState) => (includeInactive: boolean) => {
    let { genders } = state;

    if (!includeInactive) {
      genders = genders.filter((g) => g.status === Status.Active);
    }

    return _sortBy(genders, 'orderRank');
  },

  preferredLanguages: (state: IState) => _sortBy(state.preferredLanguages, 'orderRank'),

  primarySpokenLanguages: (state: IState) => (includeInactive: boolean) => {
    let { primarySpokenLanguages } = state;

    if (!includeInactive) {
      primarySpokenLanguages = primarySpokenLanguages.filter((g) => g.status === Status.Active);
    }

    return _sortBy(primarySpokenLanguages, 'orderRank');
  },

  indigenousTypesItems: (state: IState) => {
    const communities = state.indigenousCommunities;
    if (communities) {
      const a = [...new Set(communities.map((community) => community.communityType))]
        .map((typeNumber: number) => {
          const indigenousType: string = EIndigenousTypes[typeNumber];
          return {
            value: typeNumber,
            text: i18n.t(`common.indigenous.types.${indigenousType}`),
          };
        });

      return _sortBy(a, 'text');
    }
    return [];
  },

  indigenousCommunitiesItems: (state: IState) => (indigenousType: EIndigenousTypes) => {
    const commmunities = state.indigenousCommunities;
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
  },

  findEffectiveJumpIndex(state: IState, getters: GetterTree<IState, IState>) {
    return (targetIndex: number) => {
      if (targetIndex <= state.currentTabIndex) {
        return targetIndex;
      }
      let isValid: boolean;
      let currentIndex;
      const householdCreate = getters.householdCreate as unknown as IHouseholdCreate;
      // For each step between where we are and where we're jumping to
      for (currentIndex = state.currentTabIndex; currentIndex < targetIndex; currentIndex += 1) {
        const currentTabName = state.tabs[currentIndex].componentName;

        switch (currentTabName) {
          case 'isRegistered':
            isValid = isRegisteredValid();
            break;
          case 'PrivacyStatement':
          case 'SplitHouseholdEvent':
            isValid = privacyStatementValid(mode, state);
            break;
          case 'PersonalInformation':
            isValid = personalInformationValid(householdCreate, skipAgeRestriction, skipEmailPhoneRules);
            break;
          case 'Addresses':
            isValid = addressesValid(householdCreate, getters.noFixedHome as unknown as boolean);
            break;
          case 'AdditionalMembers':
            isValid = additionalMembersValid(householdCreate);
            break;
          case 'ReviewRegistration':
            isValid = reviewRegistrationValid();
            break;
          case 'SplitHouseholdMembers':
          case 'ReviewSplit':
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
    };
  },

  privacyStatementIsValid(state: IState): boolean {
    return state.isPrivacyAgreed;
  },

  noFixedHome(state: IState): boolean {
    return state.householdCreate.noFixedHome;
  },

  registrationResponse: (state: IState) => state.registrationResponse,

  registrationErrors: (state: IState) => state.registrationErrors,

  householdCreate: (state: IState) => _cloneDeep(state.householdCreate),

  personalInformation: (state: IState) => _cloneDeep(
    _merge(state.householdCreate.primaryBeneficiary.contactInformation, state.householdCreate.primaryBeneficiary.identitySet),
  ),

  isSplitMode: (state: IState) => !!(state.splitHousehold),
});

const mutations = (mode: ERegistrationMode): MutationTree<IState> => ({
  setEvent(state: IState, payload: IEventData) {
    state.event = payload;
  },

  setAssessmentToComplete(state: IState, payload: { registrationAssessment: IRegistrationAssessment, assessmentForm: IAssessmentFormEntity }) {
    state.assessmentToComplete = payload;
    if (state.assessmentToComplete?.assessmentForm?.status !== Status.Active) {
      state.assessmentToComplete = null;
    }

    // we keep the Assessment tab only if we have an assessment that can be completed
    // rules say that it must be active and published to be visible to self-registration
    // but can be unpublished if CRC is doing the registration
    const tabs = _cloneDeep(state.allTabs.filter((t) => t.id !== 'assessment'
      || (state.assessmentToComplete?.assessmentForm?.status === Status.Active
        && (mode === ERegistrationMode.CRC || state.assessmentToComplete.assessmentForm.publishStatus === PublishStatus.Published))));
    if (tabs.find((t) => t.id === 'assessment')) {
      // for self registration the confirmation will not be the last step so we rename the button
      const confTab = tabs.find((t) => t.id === 'confirmation' && mode === ERegistrationMode.Self);
      if (confTab) {
        confTab.nextButtonTextKey = 'common.button.next';
      }
    }
    state.tabs = tabs;
  },

  toggleLeftMenu(state: IState, payload: boolean) {
    state.isLeftMenuOpen = payload;
  },

  setCurrentTabIndex(state: IState, payload: number) {
    state.currentTabIndex = payload;
  },

  mutateCurrentTab(state: IState, callback: (targetTab: IRegistrationMenuItem) => void) {
    const currentTab = state.tabs[state.currentTabIndex];
    callback(currentTab);
  },

  mutateTabAtIndex(state: IState, { targetIndex, callback }: { targetIndex: number; callback: (targetTab: IRegistrationMenuItem) => void }) {
    const targetTab = state.tabs[targetIndex];
    callback(targetTab);
  },

  jump(state: IState, toIndex: number): void {
    const currentIndex = state.currentTabIndex;
    if (toIndex === currentIndex || toIndex < 0 || toIndex >= state.tabs.length) {
      return;
    }

    state.tabs[currentIndex].isTouched = true;

    state.currentTabIndex = toIndex;
  },

  setIsPrivacyAgreed(state: IState, payload: boolean) {
    state.isPrivacyAgreed = payload;
  },

  setDateTimeConsent(state: IState, payload: string) {
    state.householdCreate.consentInformation.privacyDateTimeConsent = payload;
  },

  setGenders(state: IState, payload: IOptionItemData[]) {
    state.genders = payload;
  },

  setGendersFetched(state: IState, payload: boolean) {
    state.gendersFetched = payload;
  },

  setPreferredLanguages(state: IState, payload: IOptionItemData[]) {
    state.preferredLanguages = payload;
  },

  setPrimarySpokenLanguages(state: IState, payload: IOptionItemData[]) {
    state.primarySpokenLanguages = payload;
  },

  setPrimarySpokenLanguagesFetched(state: IState, payload: boolean) {
    state.primarySpokenLanguagesFetched = payload;
  },

  setIndigenousCommunities(state: IState, { communities }: { communities: IIndigenousCommunityData[] }) {
    state.indigenousCommunities = communities;
  },

  setLoadingIndigenousCommunities(state: IState, payload: boolean) {
    state.loadingIndigenousCommunities = payload;
  },

  setPrivacyCRCUsername(state: IState, payload: string) {
    state.householdCreate.consentInformation.crcUserName = payload;
  },

  setPrivacyRegistrationMethod(state: IState, payload: ERegistrationMethod) {
    state.householdCreate.consentInformation.registrationMethod = payload;
  },

  setPrivacyRegistrationLocationId(state: IState, payload: string) {
    state.householdCreate.consentInformation.registrationLocationId = payload;
  },

  setRegistrationResponse(state: IState, payload: IDetailedRegistrationResponse) {
    state.registrationResponse = payload;
  },

  setSubmitLoading(state: IState, payload: boolean) {
    state.submitLoading = payload;
  },

  setRegistrationErrors(state: IState, payload: IServerError) {
    state.registrationErrors = payload;
  },

  increaseInlineEditCounter(state: IState) {
    state.inlineEditCounter += 1;
  },

  decreaseInlineEditCounter(state: IState) {
    if (state.inlineEditCounter >= 1) {
      state.inlineEditCounter -= 1;
    }
  },

  setHouseholdResultsShown(state: IState, payload: boolean) {
    state.householdResultsShown = payload;
  },

  resetState(state: IState, tabs: IRegistrationMenuItem[]) {
    resetVuexModuleState(state, getDefaultState(tabs));
  },

  setPersonalInformation(state: IState, payload: IContactInformation & IdentitySet) {
    state.householdCreate.primaryBeneficiary.contactInformation = new ContactInformation(payload);
    state.householdCreate.primaryBeneficiary.identitySet = new IdentitySet(payload);
  },

  setPrimaryBeneficiary(state: IState, payload: IMember) {
    state.householdCreate.primaryBeneficiary = new Member(payload);
  },

  setIdentity(state: IState, payload: IIdentitySetData) {
    state.householdCreate.primaryBeneficiary.identitySet.setIdentity(payload);
  },

  setIndigenousIdentity(state: IState, payload: IIdentitySetData) {
    state.householdCreate.primaryBeneficiary.identitySet.setIndigenousIdentity(payload);
  },

  setContactInformation(state: IState, payload: IContactInformation) {
    state.householdCreate.primaryBeneficiary.contactInformation = new ContactInformation(payload);
  },

  setCurrentAddress(state: IState, payload: ICurrentAddress) {
    const oldAddress = state.householdCreate.primaryBeneficiary.currentAddress;

    state.householdCreate.additionalMembers.forEach((m: IMember) => {
      if (_isEqual(m.currentAddress, oldAddress)) {
        m.setCurrentAddress(payload);
      }
    });
    state.householdCreate.primaryBeneficiary.currentAddress = _cloneDeep(payload);
  },

  setHomeAddress(state: IState, payload: IAddress) {
    state.householdCreate.homeAddress = _cloneDeep(payload);
  },

  setNoFixedHome(state: IState, payload: boolean) {
    state.householdCreate.noFixedHome = payload;
  },

  addAdditionalMember(state: IState, { payload, sameAddress }: { payload: IMember; sameAddress: boolean }) {
    state.householdCreate.addAdditionalMember(payload, sameAddress);
  },

  removeAdditionalMember(state: IState, index: number) {
    state.householdCreate.removeAdditionalMember(index);
  },

  editAdditionalMember(state: IState, { payload, index, sameAddress }: { payload: IMember; index: number; sameAddress: boolean }) {
    state.householdCreate.editAdditionalMember(payload, index, sameAddress);
  },

  resetHouseholdCreate(state: IState) {
    state.householdCreate = new HouseholdCreate();
  },

  setHouseholdAssociationMode(state: IState, payload: boolean) {
    state.householdAssociationMode = payload;
  },

  setHouseholdAlreadyRegistered(state: IState, payload: boolean) {
    state.householdAlreadyRegistered = payload;
  },

  setHouseholdCreate(state: IState, payload: IHouseholdCreateData) {
    state.householdCreate = new HouseholdCreate(payload);
  },

  setSplitHousehold(
state: IState,
    { originHouseholdId, primaryMember, additionalMembers }: { originHouseholdId: string; primaryMember: IMember; additionalMembers: IMember[] },
) {
    state.splitHousehold = { originHouseholdId, splitMembers: { primaryMember, additionalMembers } };
  },

  resetSplitHousehold(state: IState) {
    state.splitHousehold = null;
    state.event = null;
    state.registrationErrors = null;
    state.registrationResponse = null;
    state.currentTabIndex = 0;
    state.isPrivacyAgreed = false;
    state.householdResultsShown = false;
  },

  setTabs(state: IState, tabs: IRegistrationMenuItem[]) {
    state.tabs = tabs;
    state.allTabs = tabs;
  },

  setInformationFromBeneficiarySearch(state: IState, infoObject: IInformationFromBeneficiarySearch) {
    state.informationFromBeneficiarySearch = infoObject;
  },
});

const actions = (mode: ERegistrationMode) => ({
  async fetchEvent(
    this: IStore<IState>,
    context: ActionContext<IState, IState>,
    { lang, registrationLink }: { lang: string; registrationLink: string },
  ): Promise<IEvent> {
    const result = await this.$services.publicApi.fetchRegistrationEvent(lang, registrationLink);
    const eventData = result?.value?.length > 0 ? (result.value[0] as { entity: IEvent }).entity : null;
    context.commit('setEvent', eventData);

    return context.getters.event;
  },

  async fetchGenders(this: IStore<IState>, context: ActionContext<IState, IState>): Promise<IOptionItemData[]> {
    if (!context.state.primarySpokenLanguagesFetched) {
      const data: IOptionItemData[] = await this.$services.households.getGenders();

      if (data?.length > 0) {
        context.commit('setGenders', data);
        context.commit('setGendersFetched', true);
      }
    }

    return context.getters.genders;
  },

  async fetchPreferredLanguages(this: IStore<IState>, context: ActionContext<IState, IState>): Promise<(IOptionItemData & { languageCode: string })[]> {
    if (!context.state.preferredLanguages?.length) {
      const data: IOptionItemData[] = await this.$services.households.getPreferredLanguages();

      if (data?.length > 0) {
        context.commit('setPreferredLanguages', data.filter((entry) => entry.status === EOptionItemStatus.Active));
      }
    }

    return context.getters.preferredLanguages;
  },

  async fetchPrimarySpokenLanguages(this: IStore<IState>, context: ActionContext<IState, IState>): Promise<IOptionItemData[]> {
    if (!context.state.primarySpokenLanguagesFetched) {
      const data: IOptionItemData[] = await this.$services.households.getPrimarySpokenLanguages();

      if (data?.length > 0) {
        context.commit('setPrimarySpokenLanguages', data);
        context.commit('setPrimarySpokenLanguagesFetched', true);
      }
    }

    return context.getters.primarySpokenLanguages;
  },

  async fetchIndigenousCommunities(
    this: IStore<IState>,
    context: ActionContext<IState, IState>,
  ): Promise<IIndigenousCommunityData[]> {
    let communities: IIndigenousCommunityData[] = context.state.indigenousCommunities;

    if (communities.length === 0) {
      context.commit('setLoadingIndigenousCommunities', true);

      try {
        const result = await this.$services.households.getIndigenousCommunities();

        if (result?.length > 0) {
          communities = result.filter((entry: IIndigenousCommunityData) => entry.status === EOptionItemStatus.Active);
        }
      } finally {
        context.commit('setIndigenousCommunities', { communities });
        context.commit('setLoadingIndigenousCommunities', false);
      }
    }

    return communities;
  },

  async submitRegistration(
    this: IStore<IState>,
    context: ActionContext<IState, IState>,
    recaptchaToken?: string,
  ): Promise<IDetailedRegistrationResponse> {
    let result: IDetailedRegistrationResponse;
    context.commit('setSubmitLoading', true);
    try {
      let result;
      if (mode === ERegistrationMode.Self) {
        result = await this.$services.households.submitRegistration({
          household: context.state.householdCreate,
          eventId: context.state.event.id,
          recaptchaToken,
        });
      } else {
        result = await this.$services.households.submitCRCRegistration(context.state.householdCreate, context.state.event.id);
      }
      context.commit('setRegistrationResponse', result);
      context.commit('setRegistrationErrors', null);
    } catch (error) {
      const e = (error as IServerError).response?.data?.errors || error;
      applicationInsights.trackTrace(`submitRegistration error - self: ${mode === ERegistrationMode.Self}`, { error: e }, 'store.registration', 'submitRegistration');
      context.commit('setRegistrationErrors', error);
    } finally {
      context.commit('setSubmitLoading', false);
    }

    return result;
  },

  async updatePersonContactInformation(
    this: IStore<IState>,
    context: ActionContext<IState, IState>,
    { member, isPrimaryMember, index = -1 }: { member: IMember; isPrimaryMember: boolean; index: number },
  ): Promise<IHouseholdEntity> {
    const result = await this.$services.households.updatePersonContactInformation(
member.id,
      { contactInformation: member.contactInformation, identitySet: member.identitySet, isPrimaryBeneficiary: isPrimaryMember },
);

    if (result) {
      if (isPrimaryMember) {
        context.commit('setPersonalInformation', { ...member.contactInformation, ...member.identitySet });
      } else if (index >= 0) {
        context.commit('editAdditionalMember', { payload: member, index, sameAddress: false });
      }
    }

    return result || null;
  },

  async updatePersonIdentity(
    this: IStore<IState>,
    context: ActionContext<IState, IState>,
    { member, isPrimaryMember, index = -1 }: { member: IMember; isPrimaryMember: boolean; index: number },
  ): Promise<IHouseholdEntity> {
    const result = await this.$services.households.updatePersonIdentity(
member.id,
      { contactInformation: member.contactInformation, identitySet: member.identitySet },
);

    if (result) {
      if (isPrimaryMember) {
        context.commit('setPersonalInformation', { ...member.contactInformation, ...member.identitySet });
      } else if (index >= 0) {
        context.commit('editAdditionalMember', { payload: member, index, sameAddress: false });
      }
    }

    return result || null;
  },

  async updatePersonAddress(
    this: IStore<IState>,
    context: ActionContext<IState, IState>,
    {
      member, isPrimaryMember, index = -1, sameAddress = false,
    }: { member: IMember; isPrimaryMember: boolean; index: number; sameAddress: boolean },
  ): Promise<IHouseholdEntity> {
    let result;
    if (isPrimaryMember) {
      result = await this.$services.households.updatePersonAddress(member.id, member.currentAddress);
      if (result) {
        context.commit('setCurrentAddress', member.currentAddress);
      }
    } else if (index >= 0) {
      let address = { ...member.currentAddress };
      if (sameAddress) {
        address = context.state.householdCreate.primaryBeneficiary.currentAddress;
      }

      result = await this.$services.households.updatePersonAddress(member.id, address);
      if (result) {
        context.commit('editAdditionalMember', { payload: member, index, sameAddress });
      }
    }

    return result || null;
  },

  async addAdditionalMember(
    this: IStore<IState>,
    context: ActionContext<IState, IState>,
    { householdId, member, sameAddress = false }: { householdId: string; member: IMember; sameAddress: boolean },
  ): Promise<IHouseholdEntity> {
    if (sameAddress) {
      member.currentAddress = { ...context.state.householdCreate.primaryBeneficiary.currentAddress };
    }
    const res = await this.$services.households.addMember(householdId, member);
    if (res) {
      context.commit('addAdditionalMember', { payload: new Member({ ...member, id: res.members[res.members.length - 1] }), sameAddress });
    }
    return res;
  },

  async deleteAdditionalMember(
    this: IStore<IState>,
    context: ActionContext<IState, IState>,
    { householdId, memberId, index }: { householdId: string; memberId: string; index: number },
  ): Promise<IHouseholdEntity> {
    const res = await this.$services.households.deleteAdditionalMember(householdId, memberId);
    if (res) {
      context.commit('removeAdditionalMember', index);
    }
    return res;
  },

  async splitHousehold(
    this: IStore<IState>,
    context: ActionContext<IState, IState>,
  ): Promise<IDetailedRegistrationResponse> {
    let result: IDetailedRegistrationResponse;
    context.commit('setSubmitLoading', true);
    try {
      const { originHouseholdId } = context.state.splitHousehold;
      result = await this.$services.households.splitHousehold(context.state.householdCreate, originHouseholdId, context.state.event.id);
      context.commit('setRegistrationResponse', result);
    } catch (e) {
      applicationInsights.trackTrace('splitHousehold error', { error: e }, 'store.registration', 'splitHousehold');
      context.commit('setRegistrationErrors', e);
    } finally {
      context.commit('setSubmitLoading', false);
    }

    return result;
  },
});

export const makeRegistrationModule = (
  {
    i18n,
    tabs,
    skipAgeRestriction,
    skipEmailPhoneRules,
    mode,
  }: { i18n: VueI18n; tabs: IRegistrationMenuItem[]; skipAgeRestriction: boolean; skipEmailPhoneRules: boolean; mode: ERegistrationMode },
): Module<IState, IRootState> => ({
  namespaced: true,
  state: moduleState(tabs) as IState,
  getters: getters(i18n, skipAgeRestriction, skipEmailPhoneRules, mode),
  mutations: mutations(mode),
  actions: actions(mode) as unknown as ActionTree<IState, IRootState>,
});
