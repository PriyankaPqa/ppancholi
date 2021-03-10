import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import { ILeftMenuItem } from '@/types';
import { IRootState } from '@/store/store.types';
import { IEvent, Event } from '@/entities/event';
import {
  IOptionItemData,
  IIndigenousCommunityData,
} from '@/entities/beneficiary';
import _sortBy from 'lodash/sortBy';
import { EOptionItemStatus } from '@/constants/EOptionItemStatus';
import { tabs } from './tabs';
import { IState } from './registration.types';

const getDefaultState = (): IState => ({
  event: null,
  isLeftMenuOpen: true,
  tabs,
  currentTabIndex: 0,
  genders: [],
  preferredLanguages: [],
  primarySpokenLanguages: [],
  indigenousTypes: [],
  indigenousCommunities: [],
});

const moduleState: IState = getDefaultState();

const getters = {

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

  indigenousTypes: (state: IState) => _sortBy(state.indigenousTypes, 'orderRank'),

  indigenousCommunities: (state: IState) => _sortBy(state.indigenousCommunities, 'orderRank'),
};

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

  jump(state: IState, toIndex: number): void {
    const currentIndex = state.currentTabIndex;
    if (toIndex === currentIndex || toIndex < 0 || toIndex >= state.tabs.length) return;

    state.tabs[currentIndex].isTouched = true;

    state.currentTabIndex = toIndex;
  },
};

const actions = {
  async fetchEvent(
    this: Store<IState>,
    context: ActionContext<IState, IState>,
    { lang, registrationLink }: { lang: string; registrationLink: string },
  ): Promise<IEvent> {
    const events = await this.$services.events.searchEvents(lang, registrationLink);

    if (events?.length > 0) {
      context.commit('setEvent', events[0]);
    }

    return context.getters.event;
  },

  async fetchGenders(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionItemData[]> {
    const data: IOptionItemData[] = await this.$services.beneficiaries.getGenders();

    if (data?.length > 0) {
      context.state.genders = data.filter((entry) => entry.itemStatus === EOptionItemStatus.Active);
    }

    return data;
  },

  async fetchPreferredLanguages(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionItemData[]> {
    const data: IOptionItemData[] = await this.$services.beneficiaries.getPreferredLanguages();

    if (data?.length > 0) {
      context.state.preferredLanguages = data.filter((entry) => entry.itemStatus === EOptionItemStatus.Active);
    }

    return data;
  },

  async fetchPrimarySpokenLanguages(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionItemData[]> {
    const data: IOptionItemData[] = await this.$services.beneficiaries.getPrimarySpokenLanguages();

    if (data?.length > 0) {
      context.state.primarySpokenLanguages = data.filter((entry) => entry.itemStatus === EOptionItemStatus.Active);
    }

    return data;
  },

  async fetchIndigenousTypes(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionItemData[]> {
    const data: IOptionItemData[] = await this.$services.beneficiaries.getIndigenousTypes();

    if (data?.length > 0) {
      context.state.indigenousTypes = data.filter((entry) => entry.itemStatus === EOptionItemStatus.Active);
    }

    return data;
  },

  async fetchIndigenousCommunities(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IIndigenousCommunityData[]> {
    const data: IIndigenousCommunityData[] = await this.$services.beneficiaries.getIndigenousCommunities();

    if (data?.length > 0) {
      context.state.indigenousCommunities = data;
    }

    return data;
  },
};

export const registration: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: (actions as unknown) as ActionTree<IState, IRootState>,
};
