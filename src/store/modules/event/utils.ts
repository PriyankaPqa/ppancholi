import { ActionContext } from 'vuex';
import {
  EEventStatus,
  EResponseLevel, IEvent, IEventData, IEventLocation, IEventSearchData, IRelatedEventsInfos,
} from '@/entities/event';
import { IOptionItemData } from '@/entities/optionItem';
import { ECanadaProvinces, IListOption, IMultilingual } from '@/types';
import helpers from '@/ui/helpers';
import utils from '@/entities/utils';
import { IRootState } from '../../store.types';
import { IState } from './event.types';

const getEventTypeName = (eventType: IListOption, eventTypes: IOptionItemData[]): IMultilingual => {
  const eventTypeData = eventTypes.find((t) => t.id === eventType.optionItemId);

  if (!eventTypeData) return null;
  if (eventTypeData.isOther && eventType.specifiedOther) {
    return helpers.fillAllTranslationsFromI18n(eventType.specifiedOther, false);
  }
  return eventTypeData.name;
};

const getProvinceName = (location: IEventLocation): IMultilingual => {
  const provinceCode = location.province;

  if (!provinceCode) return null;
  const isOther = provinceCode === ECanadaProvinces.OT;
  if (isOther) {
    return location.provinceOther;
  }
  const provinceName = helpers.fillAllTranslationsFromI18n(`common.provinces.${ECanadaProvinces[provinceCode]}`);
  return provinceName;
};

const getResponseLevelName = (responseLevel: EResponseLevel): IMultilingual => {
  const levelName = helpers.fillAllTranslationsFromI18n(`event.response_level.${EResponseLevel[responseLevel]}`);
  return levelName;
};

const getScheduleEventStatusName = (status: EEventStatus) : IMultilingual => {
  const statusName = helpers.fillAllTranslationsFromI18n(`eventsTable.eventStatus.${EEventStatus[status]}`);
  return statusName;
};

const getRelatedEventsInfos = (eventsIds: Array<uuid>, allEvents: IEvent[]):Array<IRelatedEventsInfos> => {
  if (!eventsIds) return [];

  return eventsIds.map((id) => {
    const event = allEvents.find((ev) => ev.id === id);
    if (event) {
      return {
        id,
        eventName: event.name,
      };
    }
    return null;
  });
};

export const mapEventDataToSearchData = (eventData: IEventData, context: ActionContext<IState, IRootState>) : IEventSearchData => ({
  createdDate: eventData.created,
  eventDescription: eventData.description && eventData.description.translation ? eventData.description : utils.initMultilingualAttributes(),
  eventTypeId: eventData.responseDetails.eventType.optionItemId,
  eventTypeName: getEventTypeName(eventData.responseDetails.eventType, context.state.eventTypes),
  eventId: eventData.id,
  location: eventData.location,
  eventName: eventData.name,
  number: eventData.number,
  provinceName: getProvinceName(eventData.location),
  relatedEventsInfos: getRelatedEventsInfos(eventData.relatedEventIds, context.state.events),
  registrationLink: eventData.registrationLink,
  responseDetails: eventData.responseDetails,
  responseLevelName: getResponseLevelName(eventData.responseDetails.responseLevel),
  selfRegistrationEnabled: eventData.selfRegistrationEnabled,
  schedule: eventData.schedule,
  scheduleEventStatusName: getScheduleEventStatusName(eventData.schedule.status),
  '@searchScore': null,
  eventStatus: null,
  tenantId: null,
});
