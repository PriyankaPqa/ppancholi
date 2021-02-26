import {
  Store, Module, ActionContext, ActionTree,
} from 'vuex';
import _findIndex from 'lodash/findIndex';
import _sortBy from 'lodash/sortBy';
import { IRootState } from '@/store/store.types';
import { EventType, IEventType, IEventTypeData } from '@/entities/eventType';
import {
  Event, IEvent, IEventData, IOtherProvince, IRegion,
} from '@/entities/event';
import helpers from '@/ui/helpers';
import { EOptionListItemStatus, IAzureSearchParams, IAzureSearchResult } from '@/types';
import {
  IState,
} from './event.types';

const getDefaultState = (): IState => ({
  eventTypes: [],
  events: [],
  eventTypesFetched: false,
  eventsFetched: false,
});

const moduleState: IState = getDefaultState();

const getters = {
  eventTypes: (state: IState) => (
    _sortBy(state.eventTypes.map((e) => new EventType(e)), 'orderRank')
      .filter((i) => i.itemStatus === EOptionListItemStatus.Active)
  ),

  events: (state: IState) => helpers.sortMultilingualArray(state.events.map((e) => new Event(e)), 'name'),
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
    // if (!context.state.eventTypesFetched) { disable caching until signalR events are implemented
    const data = await this.$services.eventTypes.getEventTypes();
    context.commit('setEventTypes', data);
    context.state.eventTypesFetched = true;

    return context.getters.eventTypes;
  },

  async fetchEvents(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IEvent[]> {
    if (!context.state.eventsFetched) {
      const data = await this.$services.events.getEvents();
      context.commit('setEvents', data);
      context.state.eventsFetched = true;
    }

    return context.getters.events;
  },

  async fetchOtherProvinces(this: Store<IState>): Promise<IAzureSearchResult<IOtherProvince>> {
    return this.$services.events.getOtherProvinces();
  },

  async fetchRegions(this: Store<IState>): Promise<IAzureSearchResult<IRegion>> {
    return this.$services.events.getRegions();
  },

  async searchEvents(this: Store<IState>, context: ActionContext<IState, IState>, params: IAzureSearchParams): Promise<IAzureSearchResult<IEvent>> {
    const res = await this.$services.events.searchEvents(params);
    const data = res?.value;
    return {
      ...res,
      value: data.map((el: IEventData) => (new Event(el))),
    };
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
