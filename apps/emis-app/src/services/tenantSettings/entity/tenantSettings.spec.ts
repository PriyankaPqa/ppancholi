/**
 * @group services
 */

import {
  mockCreateTenantSettingsRequest,
  mockEditColoursRequest,
  mockEditTenantDetailsRequest,
  mockSetDomainsRequest,
} from '@/entities/tenantSettings';
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

  describe('enableFeature', () => {
    it('is linked to the correct URL and params', async () => {
      const featureId = 'MOCK_ID';
      await service.enableFeature(featureId);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/feature/${featureId}/enable`);
    });
  });

  describe('disableFeature', () => {
    it('is linked to the correct URL and params', async () => {
      const featureId = 'MOCK_ID';
      await service.disableFeature(featureId);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/feature/${featureId}/disable`);
    });
  });

  describe('getUserTenants', () => {
    it('is linked to the correct url', async () => {
      await service.getUserTenants();
      expect(http.get).toHaveBeenCalledWith('www.test.com/system-management/tenants/brandings', { globalHandler: false });
    });
  });

  describe('updateColours', () => {
    it('is linked to the correct url', async () => {
      await service.updateColours(mockEditColoursRequest());
      expect(http.patch).toHaveBeenCalledWith('www.test.com/system-management/tenant-settings/colours', mockEditColoursRequest());
    });
  });

  describe('updateTenantDetails', () => {
    it('is linked to the correct url', async () => {
      await service.updateTenantDetails(mockEditTenantDetailsRequest());
      expect(http.patch).toHaveBeenCalledWith('www.test.com/system-management/tenant-settings/tenant-details', mockEditTenantDetailsRequest());
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

      expect(http.getFullResponse).toHaveBeenCalledWith('www.test.com/system-management/tenant-settings/logo/en', {
        responseType: 'blob',
        globalHandler: false,
      });
    });
  });
});
