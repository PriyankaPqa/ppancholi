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
  Event,
  IEvent,
  IEventAgreement,
  IEventCallCentre,
  IEventGenericLocation,
  IEventSearchData,
  IOtherProvince,
  IRegion,
  IUpdateCallCentrePayload,
  EEventStatus,
  IUpdateAgreementPayload,
  IUpdateRegistrationLocationPayload,
  IUpdateShelterLocationPayload,
} from '@/entities/event';
import helpers from '@/ui/helpers';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

import { IState } from './event.types';
import { mapEventDataToSearchData } from './utils';

const getDefaultState = (): IState => ({
  agreementTypes: [],
  eventTypes: [],
  events: [],
  agreementTypesFetched: false,
  eventTypesFetched: false,
  eventsFetched: false,
  getLoading: false,
  searchLoading: false,
});

const moduleState: IState = getDefaultState();

const getters = {
  agreementTypes: (state: IState) => (
    _sortBy(state.agreementTypes.map((e) => new OptionItem(e)), 'orderRank')
      .filter((i) => i.status === EOptionListItemStatus.Active)
  ),

  eventTypes: (state: IState) => (
    _sortBy(state.eventTypes.map((e) => new OptionItem(e)), 'orderRank')
      .filter((i) => i.status === EOptionListItemStatus.Active)
  ),

  events: (state: IState) => helpers.sortMultilingualArray(state.events, 'name'),

  eventsByStatus: (state: IState) => (statuses: Array<EEventStatus>) => {
    const events = state.events.filter((e: IEvent) => statuses.includes(e.schedule.status));
    return helpers.sortMultilingualArray(events, 'name');
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
  setAgreementTypes(state: IState, payload: Array<IOptionItemData>) {
    state.agreementTypes = payload;
  },

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

  setAgreementTypesFetched(state: IState, payload: boolean) {
    state.agreementTypesFetched = payload;
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
  async fetchAgreementTypes(this: Store<IState>, context: ActionContext<IState, IState>): Promise<IOptionItem[]> {
    // if (!context.state.agreementTypesFetched) { disable caching until signalR events are implemented
    const data = await this.$services.optionItems.getOptionList(EOptionLists.AgreementTypes);
    context.commit('setAgreementTypes', data);
    context.commit('setAgreementTypesFetched', true);

    return context.getters.agreementTypes;
  },

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

      const value = data.map((e: IEventSearchData) => new Event(e));

      value.forEach((e) => context.commit('addOrUpdateEvent', e));

      return {
        ...res,
        value,
      };
    } finally {
      context.commit('setSearchLoading', false);
    }
  },

  async createEvent(this: Store<IState>, context: ActionContext<IState, IRootState>, payload: IEvent): Promise<IEvent> {
    const data = await this.$services.events.createEvent(payload);
    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context, payload.id));
      context.commit('addOrUpdateEvent', event);
      return event;
    }
    return null;
  },

  async updateEvent(this: Store<IState>, context: ActionContext<IState, IRootState>, payload: IEvent): Promise<IEvent> {
    const data = await this.$services.events.updateEvent(payload);

    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context, payload.id));
      context.commit('addOrUpdateEvent', event);
      return event;
    }
    return null;
  },

  async addCallCentre(
    this: Store<IState>, context: ActionContext<IState, IRootState>, { eventId, payload }: { eventId:uuid, payload: IEventCallCentre },
  )
    : Promise<IEvent> {
    const data = await this.$services.events.addCallCentre(eventId, payload);

    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context, eventId));
      context.commit('addOrUpdateEvent', event);
      return event;
    }
    return null;
  },

  async editCallCentre(
    this: Store<IState>, context: ActionContext<IState, IRootState>, { eventId, payload }: { eventId:uuid, payload: IUpdateCallCentrePayload },
  ): Promise<IEvent> {
    const data = await this.$services.events.editCallCentre(eventId, payload);

    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context, eventId));
      context.commit('addOrUpdateEvent', event);
      return event;
    }
    return null;
  },

  async addAgreement(
    this: Store<IState>, context: ActionContext<IState, IRootState>, { eventId, payload }: { eventId: uuid, payload: IEventAgreement },
  )
    : Promise<IEvent> {
    const data = await this.$services.events.addAgreement(eventId, payload);

    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context, eventId));
      context.commit('addOrUpdateEvent', event);
      return event;
    }
    return null;
  },

  async editAgreement(
    this: Store<IState>, context: ActionContext<IState, IRootState>, { eventId, payload }: { eventId:uuid, payload: IUpdateAgreementPayload },
  ): Promise<IEvent> {
    const data = await this.$services.events.editAgreement(eventId, payload);

    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context, eventId));
      context.commit('addOrUpdateEvent', event);
      return event;
    }
    return null;
  },

  async deleteAgreement(
    this: Store<IState>, context: ActionContext<IState, IRootState>, { eventId, payload }: { eventId: uuid, payload: IEventAgreement },
  ): Promise<IEvent> {
    const data = await this.$services.events.removeAgreement(eventId, payload);
    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context, eventId));
      context.commit('addOrUpdateEvent', event);
      return event;
    }
    return null;
  },

  async addRegistrationLocation(
    this: Store<IState>, context: ActionContext<IState, IRootState>, { eventId, payload }: { eventId: uuid, payload: IEventGenericLocation },
  )
    : Promise<IEvent> {
    const data = await this.$services.events.addRegistrationLocation(eventId, payload);
    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context, eventId));
      context.commit('addOrUpdateEvent', event);
      return event;
    }
    return null;
  },

  async editRegistrationLocation(
    this: Store<IState>,
    context: ActionContext<IState, IRootState>,
    { eventId, payload }: { eventId: uuid, payload: IUpdateRegistrationLocationPayload },
  ): Promise<IEvent> {
    const data = await this.$services.events.editRegistrationLocation(eventId, payload);

    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context, eventId));
      context.commit('addOrUpdateEvent', event);
      return event;
    }
    return null;
  },

  async addShelterLocation(
    this: Store<IState>, context: ActionContext<IState, IRootState>, { eventId, payload }: { eventId: uuid, payload: IEventGenericLocation },
  )
    : Promise<IEvent> {
    const data = await this.$services.events.addShelterLocation(eventId, payload);
    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context, eventId));
      context.commit('addOrUpdateEvent', event);
      return event;
    }
    return null;
  },

  async editShelterLocation(
    this: Store<IState>,
    context: ActionContext<IState, IRootState>,
    { eventId, payload }: { eventId: uuid, payload: IUpdateShelterLocationPayload },
  ): Promise<IEvent> {
    const data = await this.$services.events.editShelterLocation(eventId, payload);
    if (data) {
      const event = new Event(mapEventDataToSearchData(data, context, eventId));
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
      const event = new Event(mapEventDataToSearchData(data, context, payload.id));
      return event;
    } catch (e) {
      context.commit('setEventSelfRegistrationEnabled', { id: payload.id, selfRegistrationEnabled: !payload.selfRegistrationEnabled });
      throw e;
    }
  },

  async setEventStatus(
    this: Store<IState>,
    context: ActionContext<IState, IRootState>,
    payload: { event: IEvent, status: EEventStatus, reason: string },
  ): Promise<IEvent> {
    const { event, status, reason } = payload;
    const { hasBeenOpen } = event;

    const data = await this.$services.events.setEventStatus(event.id, status, hasBeenOpen, reason);
    const newEvent = new Event(mapEventDataToSearchData(data, context, event.id));
    context.commit('addOrUpdateEvent', newEvent);
    return newEvent;
  },
};

export const event: Module<IState, IRootState> = {
  namespaced: true,
  state: moduleState as IState,
  getters,
  mutations,
  actions: actions as unknown as ActionTree<IState, IRootState>,
};
