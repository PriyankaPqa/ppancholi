import { mockHttp } from '@/services/httpClient.mock';
import { EventsService } from './events';

const http = mockHttp();

describe('>>> Events Service', () => {
  const service = new EventsService(http as never);

  test('searchEvents is linked to the correct URL', async () => {
    const params = {
      language: 'en',
      registrationLink: 'link',
    };

    await service.searchEvents(params.language, params.registrationLink);
    expect(http.get).toHaveBeenCalledWith('/public-search/beneficiary-event', { params });
  });
});
