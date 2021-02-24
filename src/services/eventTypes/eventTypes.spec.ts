import { mockEventTypeData } from '@/entities/eventType';
import { mockHttp } from '@/services/httpClient.mock';
import { EOptionListItemStatus } from '@/types';
import { EventTypesService } from './eventTypes';

const http = mockHttp();

describe('>>> EventTypes Service', () => {
  const service = new EventTypesService(http as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createEventType is linked to the correct URL', async () => {
    await service.createEventType(mockEventTypeData()[0]);
    expect(http.post).toHaveBeenCalledWith('/event/event-types', mockEventTypeData()[0]);
  });

  test('getEventsTypes is linked to the correct URL', async () => {
    await service.getEventTypes();
    expect(http.get).toHaveBeenCalledWith('/event/event-types');
  });

  test('updateEventTypeName is linked to the correct URL', async () => {
    const name = { translation: { en: 'ENGLISH', fr: 'FRENCH' } };
    await service.updateEventTypeName('ID', name);
    expect(http.patch).toHaveBeenCalledWith('/event/event-types/ID/name', { name });
  });

  test('updateEventTypeStatus is linked to the correct URL', async () => {
    const itemStatus = EOptionListItemStatus.Inactive;
    await service.updateEventTypeStatus('ID', itemStatus);
    expect(http.patch).toHaveBeenCalledWith('/event/event-types/ID/item-status', { itemStatus });
  });

  test('updateEventOrderRanks is linked to the correct URL', async () => {
    const reOrders = { ID_1: 1, ID_2: 2 };
    await service.updateEventTypeOrderRanks(reOrders);
    expect(http.patch).toHaveBeenCalledWith('/event/event-types/order-ranks', { reOrders });
  });

  test('setEventTypeIsOther is linked to the correct URL', async () => {
    await service.setEventTypeIsOther('ID', true);
    expect(http.patch).toHaveBeenCalledWith('/event/event-types/ID/is-other', { isOther: true });
  });

  test('setEventTypeIsDefault is linked to the correct URL', async () => {
    await service.setEventTypeIsDefault('ID', true);
    expect(http.patch).toHaveBeenCalledWith('/event/event-types/ID/is-default', { isDefault: true });
  });
});
