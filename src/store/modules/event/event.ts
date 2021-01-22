import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import _findIndex from 'lodash/findIndex';
import { IRootState } from '@/store/store.types';
import { EventType, IEventTypeData } from '@/entities/eventType';
import { Event, IEvent, IEventData } from '@/entities/event';
import {
  IState,
} from './event.types';

const getDefaultState = (): IState => ({
  eventTypes: [],
  events: [],
});

const moduleState: IState = getDefaultState();

const getters = {
  eventTypes: (state: IState) => state.eventTypes.map((e) => new EventType(e)),
};

const mutations = {
  setEventTypes(state: IState, payload: Array<IEventTypeData>) {
    state.eventTypes = payload;
  },

  addOrUpdateEvent(state: IState, payload: IEventData) {
    const index = _findIndex(state.events, { id: payload.id });

    if (index > -1) {
      state.events = [
        ...state.events.slice(0, index),
        payload,
        ...state.events.slice(index + 1),
      ];
    } else {
      state.events.push(payload);
    }
  },
};

const actions = {
  async fetchEventTypes(this: Store<IState>, context: ActionContext<IState, IState>) {
    if (!context.state.eventTypes || !context.state.eventTypes.length) {
      const data = await this.$services.events.getEventTypes();
      context.commit('setEventTypes', data);
    }

    return context.getters.eventTypes;
  },

  async createEvent(this: Store<IState>, context: ActionContext<IState, IState>, payload: IEvent): Promise<IEvent> {
    const data = await this.$services.events.createEvent(payload);
    context.commit('addOrUpdateEvent', data);

    return new Event(data);
  },
};

export const event: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
