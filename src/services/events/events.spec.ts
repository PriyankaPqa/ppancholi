import { mockHttp } from '@/services/httpClient.mock';
import { mockSearchParams } from '@/test/helpers';
import { EventsService } from './events';

const http = mockHttp();

describe('>>> Events Service', () => {
  const service = new EventsService(http as never);

  test('searchEvents is linked to the correct URL', async () => {
    const params = mockSearchParams;
    await service.searchEvents(params);
    expect(http.get).toHaveBeenCalledWith('/public-search/beneficiary-event', { params, isOData: true });
  });
});
