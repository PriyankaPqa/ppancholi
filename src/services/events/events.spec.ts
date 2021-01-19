import { mockHttp } from '@/services/httpClient.mock';
import { EventsService } from './events';

const http = mockHttp();

describe('>>> Events Service', () => {
  const service = new EventsService(http as never);

  test('getEventTypes is linked to the correct URL', async () => {
    await service.getEventTypes();
    expect(http.get).toHaveBeenCalledWith('/event/event-types');
  });
});
