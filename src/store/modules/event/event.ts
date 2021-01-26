import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import _findIndex from 'lodash/findIndex';
import { IRootState } from '@/store/store.types';
import { EventType, IEventType, IEventTypeData } from '@/entities/eventType';
import {
  Event, IEvent, IEventData, IOtherProvince, IRegion,
} from '@/entities/event';

import {
  IState,
} from './event.types';

let eventTypesFetched = false;
let eventsFetched = false;

const getDefaultState = (): IState => ({
  eventTypes: [],
  events: [],
});

const moduleState: IState = getDefaultState();

const getters = {
  eventTypes: (state: IState) => state.eventTypes.map((e) => new EventType(e)),

  events: (state: IState) => state.events.map((e) => new Event(e)),
};

const mutations = {
  setEventTypes(state: IState, payload: Array<IEventTypeData>) {
    state.eventTypes = payload;
  },

  setEvents(state: IState, payload: Array<IEventData>) {
    state.events = payload;
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
  async fetchEventTypes(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IEventType[]> {
    if (!eventTypesFetched) {
      const data = await this.$services.events.getEventTypes();
      context.commit('setEventTypes', data);
      eventTypesFetched = true;
    }

    return context.getters.eventTypes;
  },

  async fetchEvents(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IEvent[]> {
    if (!eventsFetched) {
      const data = await this.$services.events.getEvents();
      context.commit('setEvents', data);
      eventsFetched = true;
    }

    return context.getters.events;
  },

  async fetchOtherProvinces(this: Store<IState>): Promise<IOtherProvince[]> {
    return this.$services.events.getOtherProvinces();
  },

  async fetchRegions(this: Store<IState>): Promise<IRegion[]> {
    return this.$services.events.getRegions();
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
