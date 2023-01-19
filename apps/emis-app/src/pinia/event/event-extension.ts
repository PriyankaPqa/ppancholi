import { BaseStoreComponents, filterAndSortActiveItems } from '@libs/stores-lib/base';
import { EventsService, IEventsServiceMock } from '@libs/services-lib/events/entity';
import { IOptionItemsServiceMock, OptionItemsService } from '@libs/services-lib/optionItems';
import { Ref, ref } from 'vue';
import { EOptionLists, IOptionItem, IOptionItemData } from '@libs/entities-lib/optionItem';
import {
  EEventStatus, EventEntity, IEventAgreement, IEventCallCentre, IEventEntity, IEventGenericLocation, IEventLocation, IRegistrationAssessment, IdParams,
} from '@libs/entities-lib/event';
import helpers from '@/ui/helpers/helpers';
import { EEventSummarySections } from '@/types';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<IEventEntity, IdParams>,
  entityService: EventsService | IEventsServiceMock,
  optionsService: OptionItemsService | IOptionItemsServiceMock,
) {
  const eventsFetched = ref(false);
  const agreementTypes = ref([]) as Ref<IOptionItemData[]>;
  const eventTypes = ref([]) as Ref<IOptionItemData[]>;
  const agreementTypesFetched = ref(false);
  const eventTypesFetched = ref(false);

  function getAgreementTypes(filterOutInactive = true, actualValue?: string[] | string) {
    return filterAndSortActiveItems(agreementTypes.value, filterOutInactive, actualValue);
  }

  function getEventTypes(filterOutInactive = true, actualValue?: string[] | string) {
    return filterAndSortActiveItems(eventTypes.value, filterOutInactive, actualValue);
  }

  function getEventsByStatus(statuses: Array<EEventStatus>) {
    const events = baseComponents.items.value.filter((e: IEventEntity) => e?.schedule?.status && statuses.includes(e.schedule.status));
    return helpers.sortMultilingualArray(events, 'name');
  }

  function setAgreementTypes(payload: Array<IOptionItemData>) {
    agreementTypes.value = payload;
  }

  function setEventTypes(payload: Array<IOptionItemData>) {
    eventTypes.value = payload;
  }

  function setAgreementTypesFetched(payload: boolean) {
    agreementTypesFetched.value = payload;
  }

  function setEventTypesFetched(payload: boolean) {
    eventTypesFetched.value = payload;
  }

  async function fetchAgreementTypes(): Promise<IOptionItem[]> {
    if (!agreementTypesFetched.value) {
      const data = await optionsService.getOptionList(EOptionLists.AgreementTypes);
      setAgreementTypes(data);
      setAgreementTypesFetched(true);
    }

    return getAgreementTypes();
  }

  async function fetchEventTypes(): Promise<IOptionItem[]> {
    if (!eventTypesFetched.value) {
      const data = await optionsService.getOptionList(EOptionLists.EventTypes);
      setEventTypes(data);
      setEventTypesFetched(true);
    }

    return getEventTypes();
  }

  async function fetchOtherProvinces(): Promise<IEventLocation[]> {
    return entityService.getOtherProvinces();
  }

  async function fetchRegions(): Promise<IEventLocation[]> {
    return entityService.getRegions();
  }

  async function updateEventSection({
    eventId, payload, section, action,
  }: {
    eventId:uuid,
    payload: IEventCallCentre | IEventAgreement | IEventGenericLocation | IRegistrationAssessment,
    section: EEventSummarySections,
    action: 'add' | 'edit'
  }): Promise<IEventEntity> {
    // @ts-ignore
    const data = await entityService[`${action}${section}`](eventId, payload);

    if (data) {
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  async function deleteAgreement({ eventId, agreementId }: { eventId: uuid, agreementId: uuid }): Promise<IEventEntity> {
    const data = await entityService.removeAgreement(eventId, agreementId);
    if (data) {
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  async function deleteRegistrationAssessment({ eventId, registrationAssessmentId }: { eventId: uuid, registrationAssessmentId: uuid }): Promise<IEventEntity> {
    const data = await entityService.removeRegistrationAssessment(eventId, registrationAssessmentId);
    if (data) {
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  async function toggleSelfRegistration(payload: { id: uuid, selfRegistrationEnabled: boolean }): Promise<IEventEntity> {
    const data = await entityService.toggleSelfRegistration(payload.id, payload.selfRegistrationEnabled);
    if (data) {
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  async function setEventStatus(payload: { event: EventEntity, status: EEventStatus, reason: string }): Promise<IEventEntity> {
    const { event, status, reason } = payload;
    const { hasBeenOpen } = event;

    const data = await entityService.setEventStatus(event.id, status, hasBeenOpen, reason);
    baseComponents.set(data);
    return data;
  }

  async function createEvent(payload: IEventEntity): Promise<IEventEntity> {
    const data = await entityService.createEvent(payload);
    if (data) {
      baseComponents.addNewlyCreatedId(data);
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  async function updateEvent(payload: IEventEntity): Promise<IEventEntity> {
    const data = await entityService.updateEvent(payload);

    if (data) {
      baseComponents.set(data);
      return data;
    }
    return null;
  }

  return {
    eventsFetched,
    agreementTypes,
    eventTypes,
    agreementTypesFetched,
    eventTypesFetched,
    getAgreementTypes,
    getEventTypes,
    getEventsByStatus,
    setAgreementTypes,
    setEventTypes,
    setAgreementTypesFetched,
    setEventTypesFetched,
    fetchAgreementTypes,
    fetchEventTypes,
    fetchOtherProvinces,
    fetchRegions,
    updateEventSection,
    deleteAgreement,
    deleteRegistrationAssessment,
    toggleSelfRegistration,
    setEventStatus,
    createEvent,
    updateEvent,
  };
}
