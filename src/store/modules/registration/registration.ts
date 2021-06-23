import {
  ActionContext, ActionTree, GetterTree, Module, MutationTree,
} from 'vuex';
import _sortBy from 'lodash/sortBy';
import VueI18n from 'vue-i18n';
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import _isEqual from 'lodash/isEqual';
import { IHouseholdEntity } from '../../../entities/household';
import { ERegistrationMode } from '../../../types/enums/ERegistrationMode';
import { IError } from '../../../services/httpClient';
import {
  ECanadaProvinces, EOptionItemStatus, ERegistrationMethod, IOptionItemData, IRegistrationMenuItem,
} from '../../../types';
import { IRootState, IStore } from '../../store.types';
import {
  HouseholdCreate,
  EIndigenousTypes,
  IHouseholdCreate,
  IIndigenousIdentityData,
  IContactInformation,
  IdentitySet,
  ContactInformation,
  IMember,
  Member,
  IIdentitySetData,
  ICurrentAddress, IAddress,
} from '../../../entities/household-create';
import { Event, IEvent, IEventData } from '../../../entities/event';

import { resetVuexModuleState } from '../../storeUtils';
import {
  isRegisteredValid, privacyStatementValid, personalInformationValid, addressesValid, additionalMembersValid, reviewRegistrationValid,
} from './registrationUtils';

import { IState } from './registration.types';

const INDIGENOUS_LIMIT_RESULTS = 1000;

export const getDefaultState = (tabs: IRegistrationMenuItem[]): IState => ({
  isPrivacyAgreed: false,
  privacyDateTimeConsent: '',
  event: null,
  isLeftMenuOpen: true,
  tabs,
  currentTabIndex: 0,
  genders: [],
  preferredLanguages: [],
  primarySpokenLanguages: [],
  indigenousIdentities: {
    [ECanadaProvinces.AB]: [],
    [ECanadaProvinces.BC]: [],
    [ECanadaProvinces.MB]: [],
    [ECanadaProvinces.NB]: [],
    [ECanadaProvinces.NL]: [],
    [ECanadaProvinces.NT]: [],
    [ECanadaProvinces.NS]: [],
    [ECanadaProvinces.NU]: [],
    [ECanadaProvinces.ON]: [],
    [ECanadaProvinces.PE]: [],
    [ECanadaProvinces.QC]: [],
    [ECanadaProvinces.SK]: [],
    [ECanadaProvinces.YT]: [],
    [ECanadaProvinces.OT]: [],
  },
  loadingIndigenousIdentities: false,
  privacyCRCUsername: '',
  privacyRegistrationMethod: null,
  privacyRegistrationLocationName: '',
  registrationResponse: null,
  registrationErrors: [],
  submitLoading: false,
  inlineEditCounter: 0,
  householdResultsShown: false,
  householdCreate: new HouseholdCreate(),
});

const moduleState = (tabs: IRegistrationMenuItem[]): IState => getDefaultState(tabs);

const getters = (i18n: VueI18n, skipAgeRestriction: boolean, skipEmailPhoneRules: boolean, mode: ERegistrationMode) => ({

  event: (state: IState) => new Event(state.event),

  isLeftMenuOpen: (state: IState) => state.isLeftMenuOpen,

  tabs: (state: IState) => state.tabs,

  currentTabIndex: (state: IState) => state.currentTabIndex,

  currentTab: (state: IState) => state.tabs[state.currentTabIndex],

  previousTabName: (state: IState) => {
    if (state.currentTabIndex === 0) return 'registration.privacy_statement.start_registration';

    if (state.tabs[state.currentTabIndex].id === 'confirmation') return '';

    return state.tabs[state.currentTabIndex - 1].titleKey;
  },

  nextTabName: (state: IState) => {
    if (state.currentTabIndex >= state.tabs.length - 2) return '';
    return state.tabs[state.currentTabIndex + 1].titleKey;
  },

  genders: (state: IState) => _sortBy(state.genders, 'orderRank'),

  preferredLanguages: (state: IState) => _sortBy(state.preferredLanguages, 'orderRank'),

  primarySpokenLanguages: (state: IState) => _sortBy(state.primarySpokenLanguages, 'orderRank'),

  indigenousTypesItems: (state: IState) => (provinceCode: ECanadaProvinces) => {
    const identities = state.indigenousIdentities[provinceCode];
    if (identities) {
      return [...new Set(identities.map((identity) => identity.communityType))]
        .map((typeNumber: number) => {
          const indigenousType: string = EIndigenousTypes[typeNumber];
          return {
            value: typeNumber,
            text: i18n.t(`common.indigenous.types.${indigenousType}`),
          };
        })
        .concat([
          {
            value: EIndigenousTypes.Other,
            text: i18n.t('common.indigenous.types.Other'),
          },
        ]);
    }
    return [];
  },

  indigenousCommunitiesItems: (state: IState) => (provinceCode: ECanadaProvinces, indigenousType: EIndigenousTypes) => {
    const identities = state.indigenousIdentities[provinceCode];
    if (identities) {
      const items = identities
        .filter((i: IIndigenousIdentityData) => i.communityType === indigenousType)
        .map((i: IIndigenousIdentityData) => ({
          value: i.id,
          text: i.communityName,
        }));
      return _sortBy(items, 'text');
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
          case 'ConfirmRegistration':
          default:
          // Do nothing
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
});

const mutations = (): MutationTree<IState> => ({
  setEvent(state: IState, payload: IEventData) {
    state.event = payload;
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

  mutateTabAtIndex(state: IState, { targetIndex, callback }: {targetIndex: number; callback: (targetTab: IRegistrationMenuItem) => void}) {
    const targetTab = state.tabs[targetIndex];
    callback(targetTab);
  },

  jump(state: IState, toIndex: number): void {
    const currentIndex = state.currentTabIndex;
    if (toIndex === currentIndex || toIndex < 0 || toIndex >= state.tabs.length) return;

    state.tabs[currentIndex].isTouched = true;

    state.currentTabIndex = toIndex;
  },

  setIsPrivacyAgreed(state: IState, payload: boolean) {
    state.isPrivacyAgreed = payload;
  },

  setDateTimeConsent(state: IState, payload: string) {
    state.privacyDateTimeConsent = payload;
  },

  setGenders(state: IState, payload: IOptionItemData[]) {
    state.genders = payload;
  },

  setPreferredLanguages(state: IState, payload: IOptionItemData[]) {
    state.preferredLanguages = payload;
  },

  setPrimarySpokenLanguages(state: IState, payload: IOptionItemData[]) {
    state.primarySpokenLanguages = payload;
  },

  setIndigenousIdentities(state: IState, { provinceCode, identities }: {provinceCode: ECanadaProvinces; identities: IIndigenousIdentityData[]}) {
    state.indigenousIdentities[provinceCode] = identities;
  },

  setLoadingIndigenousIdentities(state: IState, payload: boolean) {
    state.loadingIndigenousIdentities = payload;
  },

  setPrivacyCRCUsername(state: IState, payload: string) {
    state.privacyCRCUsername = payload;
  },

  setPrivacyRegistrationMethod(state: IState, payload: ERegistrationMethod) {
    state.privacyRegistrationMethod = payload;
  },

  setPrivacyRegistrationLocationName(state: IState, payload: string) {
    state.privacyRegistrationLocationName = payload;
  },

  setRegistrationResponse(state: IState, payload: IHouseholdEntity) {
    state.registrationResponse = payload;
  },

  setSubmitLoading(state: IState, payload: boolean) {
    state.submitLoading = payload;
  },

  setRegistrationErrors(state: IState, payload: IError[]) {
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
    state.householdCreate.primaryBeneficiary.contactInformation = new ContactInformation(_cloneDeep(payload));
    state.householdCreate.primaryBeneficiary.identitySet = new IdentitySet(_cloneDeep(payload));
  },

  setPrimaryBeneficiary(state: IState, payload: IMember) {
    state.householdCreate.primaryBeneficiary = new Member(_cloneDeep(payload));
  },

  setIdentity(state: IState, payload: IIdentitySetData) {
    state.householdCreate.primaryBeneficiary.identitySet.setIdentity(_cloneDeep(payload));
  },

  setIndigenousIdentity(state: IState, payload: IIdentitySetData) {
    state.householdCreate.primaryBeneficiary.identitySet.setIndigenousIdentity(_cloneDeep(payload));
  },

  setContactInformation(state: IState, payload: IContactInformation) {
    state.householdCreate.primaryBeneficiary.contactInformation = new ContactInformation(_cloneDeep(payload));
  },

  setCurrentAddress(state: IState, payload: ICurrentAddress) {
    const oldAddress = state.householdCreate.primaryBeneficiary.currentAddress;

    state.householdCreate.additionalMembers.forEach((m: IMember) => {
      if (_isEqual(m.currentAddress, oldAddress)) {
        m.setCurrentAddress(_cloneDeep(payload));
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

  addAdditionalMember(state: IState, { payload, sameAddress }: {payload: IMember; sameAddress: boolean}) {
    state.householdCreate.addAdditionalMember(payload, sameAddress);
  },

  removeAdditionalMember(state: IState, index: number) {
    state.householdCreate.removeAdditionalMember(index);
  },

  editAdditionalMember(state: IState, { payload, index, sameAddress }: {payload: IMember; index: number; sameAddress: boolean}) {
    state.householdCreate.editAdditionalMember(_cloneDeep(payload), index, sameAddress);
  },

  resetHouseholdCreate(state: IState) {
    state.householdCreate = new HouseholdCreate();
  },
});

const actions = {
  async fetchEvent(
    this: IStore<IState>,
    context: ActionContext<IState, IState>,
    { lang, registrationLink }: { lang: string; registrationLink: string },
  ): Promise<IEvent> {
    const result = await this.$services.publicApi.searchEvents(lang, registrationLink);
    const eventData = result?.value?.length > 0 ? result.value[0] : null;
    context.commit('setEvent', eventData);

    return context.getters.event;
  },

  async fetchGenders(this: IStore<IState>, context: ActionContext<IState, IState>): Promise<IOptionItemData[]> {
    const data: IOptionItemData[] = await this.$services.households.getGenders();

    if (data?.length > 0) {
      context.commit('setGenders', data.filter((entry) => entry.status === EOptionItemStatus.Active));
    }

    return data;
  },

  async fetchPreferredLanguages(this: IStore<IState>, context: ActionContext<IState, IState>): Promise<IOptionItemData[]> {
    const data: IOptionItemData[] = await this.$services.households.getPreferredLanguages();

    if (data?.length > 0) {
      context.commit('setPreferredLanguages', data.filter((entry) => entry.status === EOptionItemStatus.Active));
    }

    return data;
  },

  async fetchPrimarySpokenLanguages(this: IStore<IState>, context: ActionContext<IState, IState>): Promise<IOptionItemData[]> {
    const data: IOptionItemData[] = await this.$services.households.getPrimarySpokenLanguages();

    if (data?.length > 0) {
      context.commit('setPrimarySpokenLanguages', data.filter((entry) => entry.status === EOptionItemStatus.Active));
    }

    return data;
  },

  async fetchIndigenousIdentitiesByProvince(
    this: IStore<IState>,
    context: ActionContext<IState, IState>,
    provinceCode: ECanadaProvinces,
  ): Promise<IIndigenousIdentityData[]> {
    let identities: IIndigenousIdentityData[] = context.state.indigenousIdentities[provinceCode];

    if (identities.length === 0) {
      context.commit('setLoadingIndigenousIdentities', true);

      try {
        const result = await this.$services.households.searchIndigenousIdentities({
          filter: {
            Province: provinceCode,
            TenantId: context.state.event.tenantId,
          },
          top: INDIGENOUS_LIMIT_RESULTS,
        });

        if (result?.value?.length > 0) {
          identities = result.value.filter((entry: IIndigenousIdentityData) => entry.status === EOptionItemStatus.Active);
        }
      } finally {
        context.commit('setIndigenousIdentities', { provinceCode, identities });
        context.commit('setLoadingIndigenousIdentities', false);
      }
    }

    return identities;
  },

  async submitRegistration(
    this: IStore<IState>,
    context: ActionContext<IState, IState>,
  ): Promise<IHouseholdEntity> {
    let result: IHouseholdEntity;
    context.commit('setSubmitLoading', true);
    try {
      result = await this.$services.households.submitRegistration(
        context.state.householdCreate,
        context.state.event.eventId,
        context.state.privacyDateTimeConsent,
      );
      context.commit('setRegistrationResponse', result);
    } catch (e) {
      context.commit('setRegistrationErrors', e);
    } finally {
      context.commit('setSubmitLoading', false);
    }

    return result;
  },
};

export const makeRegistrationModule = (
  {
    i18n,
    tabs,
    skipAgeRestriction,
    skipEmailPhoneRules,
    mode,
  }: {i18n: VueI18n; tabs: IRegistrationMenuItem[]; skipAgeRestriction: boolean; skipEmailPhoneRules: boolean; mode: ERegistrationMode},
): Module<IState, IRootState> => ({
  namespaced: true,
  state: moduleState(tabs) as IState,
  getters: getters(i18n, skipAgeRestriction, skipEmailPhoneRules, mode),
  mutations: mutations(),
  actions: (actions as unknown) as ActionTree<IState, IRootState>,
});
