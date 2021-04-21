import {
  Store, Module, ActionContext, ActionTree, GetterTree
} from 'vuex';
import {
  ECanadaProvinces, ILeftMenuItem, IOptionItemData, EOptionItemStatus,
} from '../../../types';
import { IRootState } from '../../store.types';
import _sortBy from 'lodash/sortBy';
import VueI18n from 'vue-i18n';
import { IIndigenousIdentityData, EIndigenousTypes, IBeneficiary, Beneficiary } from '../../../entities/beneficiary';
import { IEvent, Event } from '../../../entities/event';
import { tabs } from './tabs';
import { IState } from './registration.types';


const INDIGENOUS_LIMIT_RESULTS = 1000;

const getDefaultState = (): IState => ({
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
  },
  loadingIndigenousIdentities: false,
});

const moduleState: IState = getDefaultState();

const getters = (i18n: VueI18n) => ({

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
      const beneficiary = getters.beneficiary as unknown as IBeneficiary;
      // For each step between where we are and where we're jumping to
      for (currentIndex = state.currentTabIndex; currentIndex < targetIndex; currentIndex += 1) {
        const currentTabName = state.tabs[currentIndex].componentName;

        switch (currentTabName) {
          case 'PrivacyStatement':
            isValid = state.isPrivacyAgreed;
            break;
          case 'PersonalInformation':
            isValid = beneficiary.booleanContactInformationAndIdentityIsValid();
            break;
          case 'Addresses':
            isValid = beneficiary.booleanAddressesIsValid(getters.noFixedHome as unknown as boolean);
            break;
          case 'HouseholdMembers':
            isValid = beneficiary.booleanHouseholdMembersIsValid();
            break;
          case 'ReviewRegistration':
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
    return rootGetters['beneficiary/noFixedHome'] as boolean;
  },
});

const mutations = {
  setEvent(state: IState, payload: IEvent) {
    state.event = payload;
  },

  toggleLeftMenu(state: IState, payload: boolean) {
    state.isLeftMenuOpen = payload;
  },

  setCurrentTabIndex(state: IState, payload: number) {
    state.currentTabIndex = payload;
  },

  mutateCurrentTab(state: IState, callback: (targetTab: ILeftMenuItem) => void) {
    const currentTab = state.tabs[state.currentTabIndex];
    callback(currentTab);
  },

  mutateTabAtIndex(state: IState, { targetIndex, callback }: {targetIndex: number; callback: (targetTab: ILeftMenuItem) => void}) {
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
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    { lang, registrationLink }: { lang: string; registrationLink: string },
  ): Promise<IEvent> {
    const result = await this.$services.events.searchEvents(lang, registrationLink);
    const eventData = result?.value?.length > 0 ? result.value[0] : null;
    context.commit('setEvent', eventData);

    return context.getters.event;
  },

  async fetchGenders(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionItemData[]> {
    const data: IOptionItemData[] = await this.$services.beneficiaries.getGenders();

    if (data?.length > 0) {
      context.commit('setGenders', data.filter((entry) => entry.status === EOptionItemStatus.Active));
    }

    return data;
  },

  async fetchPreferredLanguages(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionItemData[]> {
    const data: IOptionItemData[] = await this.$services.beneficiaries.getPreferredLanguages();

    if (data?.length > 0) {
      context.commit('setPreferredLanguages', data.filter((entry) => entry.status === EOptionItemStatus.Active));
    }

    return data;
  },

  async fetchPrimarySpokenLanguages(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionItemData[]> {
    const data: IOptionItemData[] = await this.$services.beneficiaries.getPrimarySpokenLanguages();

    if (data?.length > 0) {
      context.commit('setPrimarySpokenLanguages', data.filter((entry) => entry.status === EOptionItemStatus.Active));
    }

    return data;
  },

  async fetchIndigenousIdentitiesByProvince(
    this: Store<IState>,
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
};

export const makeRegistrationModule = (i18n: VueI18n): Module<IState, IRootState> => ({
  namespaced: true,
  state: moduleState as IState,
  getters: getters(i18n),
  mutations,
  actions: (actions as unknown) as ActionTree<IState, IRootState>,
});
