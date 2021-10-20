import { mockCreateTenantSettingsRequest, mockSetDomainsRequest } from '@/entities/tenantSettings';
import { IHttpMock, mockHttp } from '@/services/httpClient.mock';
import { TenantSettingsService } from './tenantSettings';

describe('>>> TenantSettings service', () => {
  let http: IHttpMock;
  let service: TenantSettingsService;

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.VUE_APP_API_BASE_URL = 'www.test.com';
    jest.clearAllMocks();
    http = mockHttp();
    service = new TenantSettingsService(http as never);
  });

  describe('getCurrentTenantSettings', () => {
    it('is linked to the correct url', async () => {
      await service.getCurrentTenantSettings();
      expect(http.get).toHaveBeenCalledWith('www.test.com/system-management/tenant-settings/current-tenant-settings', { globalHandler: false });
    });
  });

  describe('createTenantSettings', () => {
    it('is linked to the correct url', async () => {
      const payload = mockCreateTenantSettingsRequest();

      await service.createTenantSettings(payload);

      expect(http.post).toHaveBeenCalledWith('www.test.com/system-management/tenant-settings', payload);
    });
  });

  describe('createTenantDomains', () => {
    it('is linked to the correct url', async () => {
      const payload = mockSetDomainsRequest();

      await service.createTenantDomains(payload);

      expect(http.patch).toHaveBeenCalledWith('www.test.com/system-management/tenant-settings/domains', payload);
    });
  });
});
