import {
  ActionContext, ActionTree,
} from 'vuex';
import { IRootState } from '@/store/store.types';
import {
  EOptionLists,
  IOptionItem,
  IOptionItemData,
} from '@/entities/optionItem';
import {
  IEventCallCentre,
  IEventGenericLocation,
  EEventStatus,
  IEventEntity,
  IEventAgreement,
  EventEntity,
  IEventLocation,
} from '@/entities/event';
import helpers from '@/ui/helpers/helpers';
import { EEventSummarySections } from '@/types';
import { EventsService } from '@/services/events/entity';
import { OptionItemsService } from '@/services/optionItems';
import { IEventEntityState } from '@/store/modules/event/eventEntity.types';
import { SignalR, ISignalRMock } from '@/ui/plugins/signal-r';
import { filterAndSortActiveItems, BaseModule } from '../base';

import { IState } from '../base/base.types';

export class EventEntityModule extends BaseModule <IEventEntity, uuid> {
  constructor(readonly service: EventsService, readonly optionsService:OptionItemsService, protected signalR: typeof SignalR | ISignalRMock) {
    super(service, signalR);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<IEventEntity>, IRootState>,
  })

  public state = {
    ...this.baseState,
    eventsFetched: false,
    agreementTypes: [] as IOptionItemData[],
    eventTypes: [] as IOptionItemData[],
    agreementTypesFetched: false,
    eventTypesFetched: false,
  }

  public getters = {
    ...this.baseGetters,

    // eslint-disable-next-line max-len
    agreementTypes: (state: IEventEntityState) => (filterOutInactive = true, actualValue?: string[] | string) => filterAndSortActiveItems(state.agreementTypes, filterOutInactive, actualValue),

    // eslint-disable-next-line max-len
    eventTypes: (state: IEventEntityState) => (filterOutInactive = true, actualValue?: string[] | string) => filterAndSortActiveItems(state.eventTypes, filterOutInactive, actualValue),

    eventsByStatus: (state:IState<IEventEntity>) => (statuses: Array<EEventStatus>) => {
      const events = state.items.filter((e: IEventEntity) => e?.schedule?.status && statuses.includes(e.schedule.status));
      return helpers.sortMultilingualArray(events, 'name');
    },
  };

  public mutations = {
    ...this.baseMutations,

    setAgreementTypes(state: IEventEntityState, payload: Array<IOptionItemData>) {
      state.agreementTypes = payload;
    },

    setEventTypes(state: IEventEntityState, payload: Array<IOptionItemData>) {
      state.eventTypes = payload;
    },

    setAgreementTypesFetched(state: IEventEntityState, payload: boolean) {
      state.agreementTypesFetched = payload;
    },

    setEventTypesFetched(state: IEventEntityState, payload: boolean) {
      state.eventTypesFetched = payload;
    },
  };

  public actions = {
    ...this.baseActions,

    fetchAgreementTypes: async (
      context: ActionContext<IEventEntityState, IEventEntityState>,
    ): Promise<IOptionItem[]> => {
      if (!this.state.agreementTypesFetched) {
        const data = await this.optionsService.getOptionList(EOptionLists.AgreementTypes);
        context.commit('setAgreementTypes', data);
        context.commit('setAgreementTypesFetched', true);
      }

      return context.getters.agreementTypes;
    },

    fetchEventTypes: async (
      context: ActionContext<IEventEntityState, IEventEntityState>,
    ): Promise<IOptionItem[]> => {
      if (!this.state.eventTypesFetched) {
        const data = await this.optionsService.getOptionList(EOptionLists.EventTypes);
        context.commit('setEventTypes', data);
        context.commit('setEventTypesFetched', true);
      }

      return context.getters.eventTypes;
    },

    fetchOtherProvinces: async (): Promise<IEventLocation[]> => this.service.getOtherProvinces(),

    fetchRegions: async (): Promise<IEventLocation[]> => this.service.getRegions(),

    updateEventSection: async (
      context: ActionContext<IEventEntityState, IEventEntityState>, {
        eventId, payload, section, action,
      }:
      { eventId:uuid,
        payload: IEventCallCentre | IEventAgreement | IEventGenericLocation,
        section: EEventSummarySections, action: 'add' | 'edit'
      },
    )
      : Promise<IEventEntity> => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const data: IEventData = await this.service[`${action}${section}`](eventId, payload);

      if (data) {
        context.commit('set', data);
        return data;
      }
      return null;
    },

    deleteAgreement: async (
      context: ActionContext<IEventEntityState, IEventEntityState>,
      { eventId, agreementId }: { eventId: uuid, agreementId: uuid },
    ): Promise<IEventEntity> => {
      const data = await this.service.removeAgreement(eventId, agreementId);
      if (data) {
        context.commit('set', data);
        return data;
      }
      return null;
    },

    toggleSelfRegistration: async (
      context: ActionContext<IEventEntityState, IEventEntityState>,
      payload: { id: uuid, selfRegistrationEnabled: boolean },
    ): Promise<IEventEntity> => {
      const data = await this.service.toggleSelfRegistration(payload.id, payload.selfRegistrationEnabled);
      if (data) {
        context.commit('set', data);
        return data;
      }
      return null;
    },

    setEventStatus: async (
      context: ActionContext<IEventEntityState, IEventEntityState>,
      payload: { event: EventEntity, status: EEventStatus, reason: string },
    ): Promise<IEventEntity> => {
      const { event, status, reason } = payload;
      const { hasBeenOpen } = event;

      const data = await this.service.setEventStatus(event.id, status, hasBeenOpen, reason);
      context.commit('set', data);
      return data;
    },

    createEvent: async (
      context: ActionContext<IEventEntityState, IEventEntityState>,
      payload: IEventEntity,
    ): Promise<IEventEntity> => {
      const data = await this.service.createEvent(payload);
      if (data) {
        context.commit('addNewlyCreatedId', data);
        context.commit('set', data);
        return data;
      }
      return null;
    },

    updateEvent: async (
      context: ActionContext<IEventEntityState, IEventEntityState>,
      payload: IEventEntity,
    ): Promise<IEventEntity> => {
      const data = await this.service.updateEvent(payload);

      if (data) {
        context.commit('set', data);
        return data;
      }
      return null;
    },
  };
}
