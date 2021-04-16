import { ActionContext } from 'vuex';
import {
  EEventStatus,
  EResponseLevel,
  IEvent,
  IEventData,
  IEventLocation,
  IEventSearchData,
  IRelatedEventsInfos,
  IEventAgreement,
  IEventAgreementInfos,
} from '@/entities/event';
import { IOptionItem } from '@/entities/optionItem';
import { ECanadaProvinces, IListOption, IMultilingual } from '@/types';
import helpers from '@/ui/helpers';
import utils from '@/entities/utils';
import { IRootState } from '../../store.types';
import { IState } from './event.types';

const getAgreementsInfos = (agreements: IEventAgreement[], agreementTypes: IOptionItem[])
: IEventAgreementInfos[] => agreements.map((agreement) => {
  const agreementTypeData = agreementTypes.find((t) => t.id === agreement.agreementType.optionItemId);
  let agreementTypeName;
  if (!agreementTypeData) agreementTypeName = null;
  if (agreementTypeData.isOther && agreement.agreementType.specifiedOther) {
    agreementTypeName = helpers.fillAllTranslationsFromI18n(agreement.agreementType.specifiedOther, false);
  } else {
    agreementTypeName = agreementTypeData.name;
  }

  return {
    ...agreement,
    agreementTypeName,
  };
});

const getEventTypeName = (eventType: IListOption, eventTypes: IOptionItem[], originalEvent: IEvent): IMultilingual => {
  if (originalEvent && originalEvent.eventTypeName && originalEvent.eventTypeId === eventType.optionItemId) {
    return originalEvent.eventTypeName;
  }

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

const getRelatedEventsInfos = (eventsIds: Array<uuid>, allEvents: IEvent[], originalEvent: IEvent): Array<IRelatedEventsInfos> => {
  if (!eventsIds) return [];

  const relatedEvents: IRelatedEventsInfos[] = [];

  eventsIds.forEach((id) => {
    if (originalEvent) {
      const originalRelatedEvent = originalEvent.relatedEventsInfos.find((re) => re.id === id);

      if (originalRelatedEvent) {
        relatedEvents.push({
          id: originalRelatedEvent.id,
          eventName: utils.initMultilingualAttributes(originalRelatedEvent.eventName),
        });

        return;
      }
    }

    const cachedEvent = allEvents.find((ev) => ev.id === id);

    if (cachedEvent) {
      relatedEvents.push({
        id,
        eventName: cachedEvent.name,
      });
    }
  });

  return relatedEvents;
};

export const mapEventDataToSearchData = (
  eventData: IEventData,
  context: ActionContext<IState, IRootState>,
  originalEventId: uuid,
) : IEventSearchData => {
  const originalEvent = context.state.events.find((e) => e.id === originalEventId);

  return {
    agreements: getAgreementsInfos(eventData.agreements, context.state.agreementTypes),
    createdDate: eventData.created,
    eventName: utils.initMultilingualAttributes(eventData.name),
    eventDescription: utils.initMultilingualAttributes(eventData.description),
    eventTypeId: eventData.responseDetails.eventType.optionItemId,
    eventTypeName: getEventTypeName(eventData.responseDetails.eventType, context.state.eventTypes, originalEvent),
    eventId: eventData.id,
    location: eventData.location,
    number: eventData.number,
    provinceName: getProvinceName(eventData.location),
    relatedEventsInfos: getRelatedEventsInfos(eventData.relatedEventIds, context.state.events, originalEvent),
    registrationLink: utils.initMultilingualAttributes(eventData.registrationLink),
    responseDetails: eventData.responseDetails,
    responseLevelName: getResponseLevelName(eventData.responseDetails.responseLevel),
    selfRegistrationEnabled: eventData.selfRegistrationEnabled,
    schedule: eventData.schedule,
    scheduleHistory: eventData.scheduleHistory,
    scheduleEventStatusName: getScheduleEventStatusName(eventData.schedule.status),
    '@searchScore': null,
    eventStatus: null,
    tenantId: null,
    callCentres: eventData.callCentres,
    registrationLocations: eventData.registrationLocations,
    shelterLocations: eventData.shelterLocations,
  };
};
