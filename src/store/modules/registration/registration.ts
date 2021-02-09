import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import { ISearchData } from '@/types';
import { IRootState } from '@/store/store.types';
import { IEvent, Event } from '@/entities/event';
import { IState } from './registration.types';

const getDefaultState = (): IState => ({
  event: null,
});

const moduleState: IState = getDefaultState();

const getters = {
  event: (state: IState) => new Event(state.event),
};

const mutations = {
  setEvent(state: IState, payload: IEvent) {
    state.event = payload;
  },
};

const actions = {
  async fetchEvent(this: Store<IState>, context: ActionContext<IState, IState>, params: ISearchData): Promise<IEvent> {
    const events = await this.$services.events.searchEvents(params);

    if (events?.length === 1) {
      context.commit('setEvent', events[0]);
    }

    return context.getters.event;
  },
};

export const registration: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: (actions as unknown) as ActionTree<IState, IRootState>,
};
