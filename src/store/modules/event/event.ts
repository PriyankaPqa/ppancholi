import {
  ActionContext, ActionTree, Module, Store,
} from 'vuex';
import _findIndex from 'lodash/findIndex';
import _sortBy from 'lodash/sortBy';
import { IRootState } from '@/store/store.types';
import {
  EOptionListItemStatus, EOptionLists, IOptionItem, IOptionItemData, OptionItem,
} from '@/entities/optionItem';
import {
  Event, IEvent, IEventCallCentre, IEventSearchData, IOtherProvince, IRegion, IUpdateCallCentrePayload, EEventStatus,
} from '@/entities/event';
import helpers from '@/ui/helpers';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

import { IState } from './event.types';
import { mapEventDataToSearchData } from './utils';

const getDefaultState = (): IState => ({
  eventTypes: [],
  events: [],
  eventTypesFetched: false,
  eventsFetched: false,
  getLoading: false,
  searchLoading: false,
});

const moduleState: IState = getDefaultState();

const getters = {
  eventTypes: (state: IState) => (
    _sortBy(state.eventTypes.map((e) => new OptionItem(e)), 'orderRank')
      .filter((i) => i.status === EOptionListItemStatus.Active)
  ),

  events: (state: IState) => helpers.sortMultilingualArray(state.events, 'name'),

  // eslint-disable-next-line
  openEvents: (state: IState) => {
    const openEvents = state.events.filter((e) => e.schedule.status === EEventStatus.Open);
    return helpers.sortMultilingualArray(openEvents, 'name');
  },

  eventById: (state: IState) => (id: uuid) => {
    const event = state.events.find((e) => e.id === id);
    if (event) {
      return event;
    }
    return null;
  },
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

  setGetLoading(state: IState, payload: boolean) {
    state.getLoading = payload;
  },

  setSearchLoading(state: IState, payload: boolean) {
    state.searchLoading = payload;
  },

  setEventSelfRegistrationEnabled(state: IState, payload: { id: uuid; selfRegistrationEnabled: boolean }) {
    const event = state.events.find((e) => e.id === payload.id);

    if (event) {
      event.selfRegistrationEnabled = payload.selfRegistrationEnabled;
    }
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
    // const event = context.state.events.find((event) => event.id === id); { disable caching until signalR events are implemented

    // if (event) {
    //   return event;
    // }

    try {
      context.commit('setGetLoading', true);

      const params = { filter: { EventId: id } };
      const res = await this.$services.events.searchEvents(params);
      if (res?.value.length === 1) {
        const data = res.value[0];
        context.commit('addOrUpdateEvent', new Event(data));
        return new Event(data);
      }
      return null;
    } finally {
      context.commit('setGetLoading', false);
    }
  },

  async fetchEvents(this: Store<IState>, context: ActionContext<IState, IRootState>): Promise<IEvent[]> {
    if (!context.state.eventsFetched) {
      try {
        context.commit('setGetLoading', true);

        const res = await this.$services.events.searchEvents({});
        const data = res?.value;
        if (data) {
          context.commit('setEventsFetched', true);
          context.commit('setEvents', data.map((ev) => new Event(ev)));
        }
      } finally {
        context.commit('setGetLoading', false);
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

  async addCallCentre(
    this: Store<IState>, context: ActionContext<IState, IRootState>, { eventId, payload }: {eventId:uuid, payload: IEventCallCentre},
  )
    : Promise<IEvent> {
    const data = await this.$services.events.addCallCentre(eventId, payload);

    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context));
      context.commit('addOrUpdateEvent', event);
      return event;
    }
    return null;
  },

  async editCallCentre(
    this: Store<IState>, context: ActionContext<IState, IRootState>, { eventId, payload }: {eventId:uuid, payload: IUpdateCallCentrePayload},
  ): Promise<IEvent> {
    const data = await this.$services.events.editCallCentre(eventId, payload);

    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context));
      context.commit('addOrUpdateEvent', event);
      return event;
    }
    return null;
  },

  async toggleSelfRegistration(
    this: Store<IState>,
    context: ActionContext<IState, IRootState>,
    payload: { id: uuid, selfRegistrationEnabled: boolean },
  ): Promise<IEvent> {
    try {
      context.commit('setEventSelfRegistrationEnabled', payload);
      const data = await this.$services.events.toggleSelfRegistration(payload.id, payload.selfRegistrationEnabled);
      const event = new Event(mapEventDataToSearchData(data, context));
      return event;
    } catch (e) {
      context.commit('setEventSelfRegistrationEnabled', { id: payload.id, selfRegistrationEnabled: !payload.selfRegistrationEnabled });
      throw e;
    }
  },
};

export const event: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
