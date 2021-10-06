import { mockEditColoursRequest, mockEditTenantDetailsRequest } from '@/entities/branding';
import { IHttpMock, mockHttp } from '@/services/httpClient.mock';
import { BrandingsService } from './brandings';

describe('>>> Brandings service', () => {
  let http: IHttpMock;
  let service: BrandingsService;

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.VUE_APP_API_BASE_URL = 'www.test.com';
    jest.clearAllMocks();
    http = mockHttp();
    service = new BrandingsService(http as never);
  });

  describe('updateColours', () => {
    it('is linked to the correct url', async () => {
      await service.updateColours(mockEditColoursRequest());
      expect(http.patch).toHaveBeenCalledWith('www.test.com/system-management/brandings/colours', mockEditColoursRequest());
    });
  });

  describe('updateTenantDetails', () => {
    it('is linked to the correct url', async () => {
      await service.updateTenantDetails(mockEditTenantDetailsRequest());
      expect(http.patch).toHaveBeenCalledWith('www.test.com/system-management/brandings/tenant-details', mockEditTenantDetailsRequest());
    });
  });

  describe('getLogoUrl', () => {
    it('is linked to the correct url', async () => {
      http.getFullResponse = jest.fn(() => Promise.resolve({
        data: 'data',
        headers: {},
      }));

      window.URL.createObjectURL = jest.fn();

      await service.getLogoUrl('en');

      expect(http.getFullResponse).toHaveBeenCalledWith('www.test.com/system-management/brandings/logo/en', { responseType: 'blob' });
    });
  });
});
