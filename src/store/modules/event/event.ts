import {
  ActionContext, ActionTree, Module, Store,
} from 'vuex';
import _findIndex from 'lodash/findIndex';
import _sortBy from 'lodash/sortBy';
import { IRootState } from '@/store/store.types';
import {
  IOptionItem, IOptionItemData, OptionItem, EOptionListItemStatus, EOptionLists,
} from '@/entities/optionItem';
import {
  Event, IEvent, IEventSearchData, IOtherProvince, IRegion,
} from '@/entities/event';
import helpers from '@/ui/helpers';
import {
  IAzureSearchParams, IAzureSearchResult,
} from '@/types';

import { IState } from './event.types';
import { mapEventDataToSearchData } from './utils';

const getDefaultState = (): IState => ({
  eventTypes: [],
  events: [],
  eventTypesFetched: false,
  eventsFetched: false,
  searchLoading: false,
});

const moduleState: IState = getDefaultState();

const getters = {
  eventTypes: (state: IState) => (
    _sortBy(state.eventTypes.map((e) => new OptionItem(e)), 'orderRank')
      .filter((i) => i.status === EOptionListItemStatus.Active)
  ),

  events: (state: IState) => helpers.sortMultilingualArray(state.events, 'name'),
};

const mutations = {
  setEventTypes(state: IState, payload: Array<IOptionItemData>) {
    state.eventTypes = payload;
  },

  setEvents(state: IState, payload: Array<IEvent>) {
    state.events = payload;
  },

  addOrUpdateEvent(state: IState, payload: IEvent) {
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

  setEventTypesFetched(state: IState, payload: boolean) {
    state.eventTypesFetched = payload;
  },

  setEventsFetched(state: IState, payload: boolean) {
    state.eventsFetched = payload;
  },

  setSearchLoading(state: IState, payload: boolean) {
    state.searchLoading = payload;
  },
};

const actions = {
  async fetchEventTypes(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionItem[]> {
    // if (!context.state.eventTypesFetched) { disable caching until signalR events are implemented
    const data = await this.$services.optionItems.getOptionList(EOptionLists.EventTypes);
    context.commit('setEventTypes', data);
    context.commit('setEventTypesFetched', true);

    return context.getters.eventTypes;
  },

  async fetchEvent(this: Store<IState>, context: ActionContext<IState, IState>, id: uuid): Promise<IEvent> {
    const event = context.state.events.find((event) => event.id === id);

    if (event) {
      return event;
    }

    const params = { filter: { EventId: id } };
    const res = await this.$services.events.searchEvents(params);
    if (res?.value.length === 1) {
      const data = res.value[0];
      context.commit('addOrUpdateEvent', new Event(data));
      return new Event(data);
    }
    return null;
  },

  async fetchEvents(this: Store<IState>, context: ActionContext<IState, IRootState>): Promise<IEvent[]> {
    if (!context.state.eventsFetched) {
      const res = await this.$services.events.searchEvents({});
      const data = res?.value;
      if (data) {
        context.commit('setEventsFetched', true);
        context.commit('setEvents', data.map((ev) => new Event(ev)));
      }
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
    try {
      context.commit('setSearchLoading', true);
      const res = await this.$services.events.searchEvents(params);
      const data = res?.value;
      return {
        ...res,
        value: data.map((el: IEventSearchData) => (new Event(el))),
      };
    } finally {
      context.commit('setSearchLoading', false);
    }
  },

  async createEvent(this: Store<IState>, context: ActionContext<IState, IRootState>, payload: IEvent): Promise<IEvent> {
    const data = await this.$services.events.createEvent(payload);
    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context));
      context.commit('addOrUpdateEvent', event);
      return event;
    }
    return null;
  },

  async updateEvent(this: Store<IState>, context: ActionContext<IState, IRootState>, payload: IEvent): Promise<IEvent> {
    const data = await this.$services.events.updateEvent(payload);

    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context));
      context.commit('addOrUpdateEvent', event);
      return event;
    }
    return null;
  },
};

export const event: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
