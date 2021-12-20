/**
 * @group services
 */

import { IHttpMock, mockHttp } from '@/services/httpClient.mock';
import { FeaturesService } from './features';

describe('>>> Feature Service', () => {
  let http: IHttpMock;
  let service: FeaturesService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new FeaturesService(http as never);
  });

  describe('enableFeature', () => {
    it('is linked to the correct URL and params', async () => {
      const featureId = 'MOCK_ID';
      await service.enableFeature(featureId);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${featureId}/enable`);
    });
  });

  describe('disableFeature', () => {
    it('is linked to the correct URL and params', async () => {
      const featureId = 'MOCK_ID';
      await service.disableFeature(featureId);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${featureId}/disable`);
    });
  });
});
