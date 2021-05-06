import {
  Module, ActionContext, ActionTree, GetterTree,
} from 'vuex';
import _sortBy from 'lodash/sortBy';
import VueI18n from 'vue-i18n';
import {
  ECanadaProvinces, IRegistrationMenuItem, IOptionItemData, EOptionItemStatus,
} from '../../../types';
import { IRootState, IStore } from '../../store.types';
import {
  IIndigenousIdentityData, EIndigenousTypes, IBeneficiary, Beneficiary, ICreateBeneficiaryRequest,
} from '../../../entities/beneficiary';
import { IEvent, Event, IEventData } from '../../../entities/event';

import { IState } from './registration.types';

const INDIGENOUS_LIMIT_RESULTS = 1000;

const getDefaultState = (tabs: IRegistrationMenuItem[]): IState => ({
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
});

const moduleState = (tabs: IRegistrationMenuItem[]): IState => getDefaultState(tabs);

const getters = (i18n: VueI18n, skipAgeRestriction: boolean, skipEmailPhoneRules: boolean) => ({

  event: (state: IState) => new Event(state.event),

  isLeftMenuOpen: (state: IState) => state.isLeftMenuOpen,

  tabs: (state: IState) => state.tabs,

  currentTabIndex: (state: IState) => state.currentTabIndex,

  currentTab: (state: IState) => state.tabs[state.currentTabIndex],

  previousTabName: (state: IState) => {
    if (state.currentTabIndex === 0) return 'registration.privacy_statement.start_registration';
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
      let errors: string[];
      const beneficiary = getters.beneficiary as unknown as IBeneficiary;
      // For each step between where we are and where we're jumping to
      for (currentIndex = state.currentTabIndex; currentIndex < targetIndex; currentIndex += 1) {
        const currentTabName = state.tabs[currentIndex].componentName;

        switch (currentTabName) {
          case 'isRegistered':
            isValid = true;
            break;
          case 'PrivacyStatement':
            isValid = state.isPrivacyAgreed;
            break;
          case 'PersonalInformation':
            errors = beneficiary.validatePersonalInformation(skipAgeRestriction, skipEmailPhoneRules);
            isValid = errors.length === 0;
            break;
          case 'Addresses':
            errors = beneficiary.validateAddresses(getters.noFixedHome as unknown as boolean);
            isValid = errors.length === 0;
            break;
          case 'HouseholdMembers':
            errors = beneficiary.validateHouseholdMembers();
            isValid = errors.length === 0;
            break;
          case 'ReviewRegistration':
            isValid = true;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beneficiary(state: IState, getters: GetterTree<IState, IState>, rootState: IRootState, rootGetters: any): IBeneficiary {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Beneficiary(rootGetters['beneficiary/beneficiary'] as any);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  noFixedHome(state: IState, getters: GetterTree<IState, IState>, rootState: IRootState, rootGetters: any): boolean {
    return (rootGetters['beneficiary/beneficiary'] as IBeneficiary).noFixedHome;
  },
});

const mutations = {
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
};

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
    const data: IOptionItemData[] = await this.$services.beneficiaries.getGenders();

    if (data?.length > 0) {
      context.commit('setGenders', data.filter((entry) => entry.status === EOptionItemStatus.Active));
    }

    return data;
  },

  async fetchPreferredLanguages(this: IStore<IState>, context: ActionContext<IState, IState>): Promise<IOptionItemData[]> {
    const data: IOptionItemData[] = await this.$services.beneficiaries.getPreferredLanguages();

    if (data?.length > 0) {
      context.commit('setPreferredLanguages', data.filter((entry) => entry.status === EOptionItemStatus.Active));
    }

    return data;
  },

  async fetchPrimarySpokenLanguages(this: IStore<IState>, context: ActionContext<IState, IState>): Promise<IOptionItemData[]> {
    const data: IOptionItemData[] = await this.$services.beneficiaries.getPrimarySpokenLanguages();

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
        const result = await this.$services.beneficiaries.searchIndigenousIdentities({
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
  ): Promise<ICreateBeneficiaryRequest> {
    const beneficiary = context.rootGetters['beneficiary/beneficiary'] as IBeneficiary;
    const result = await this.$services.beneficiaries.submitRegistration(beneficiary, context.state.event.eventId);
    return result as ICreateBeneficiaryRequest;
  },
};

export const makeRegistrationModule = ({
  i18n, tabs, skipAgeRestriction, skipEmailPhoneRules,
}: {i18n: VueI18n; tabs: IRegistrationMenuItem[]; skipAgeRestriction: boolean; skipEmailPhoneRules: boolean}): Module<IState, IRootState> => ({
  namespaced: true,
  state: moduleState(tabs) as IState,
  getters: getters(i18n, skipAgeRestriction, skipEmailPhoneRules),
  mutations,
  actions: (actions as unknown) as ActionTree<IState, IRootState>,
});
