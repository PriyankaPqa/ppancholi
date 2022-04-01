import {
  mockCreateTenantSettingsRequest,
  mockEditColoursRequest,
  mockEditTenantDetailsRequest,
  mockSetDomainsRequest,
} from '@/entities/tenantSettings';
import { mockHttp, IHttpMock } from '@libs/core-lib/src/services/http-client';
import { TenantSettingsService } from './tenantSettings';

describe('>>> TenantSettings service', () => {
  let http: IHttpMock;
  let service: TenantSettingsService;

  beforeEach(() => {
    jest.clearAllMocks();

    http = mockHttp();
    service = new TenantSettingsService(http as never);
  });

  describe('getCurrentTenantSettings', () => {
    it('is linked to the correct url', async () => {
      await service.getCurrentTenantSettings();
      expect(http.get).toHaveBeenCalledWith('system-management/tenant-settings/current-tenant-settings', { globalHandler: false });
    });
  });

  test('getPublicFeatures is linked to the correct URL', async () => {
    await service.getPublicFeatures();
    expect(http.get).toHaveBeenCalledWith('system-management/tenant-settings/public-features');
  });

  describe('getBranding', () => {
    it('is linked to the correct url', async () => {
      await service.getBranding();
      expect(http.get).toHaveBeenCalledWith('system-management/tenant-settings/current-branding');
    });
  });

  describe('createTenantSettings', () => {
    it('is linked to the correct url', async () => {
      const payload = mockCreateTenantSettingsRequest();

      await service.createTenantSettings(payload);

      expect(http.post).toHaveBeenCalledWith('system-management/tenant-settings', payload);
    });
  });

  describe('createTenantDomains', () => {
    it('is linked to the correct url', async () => {
      const payload = mockSetDomainsRequest();

      await service.createTenantDomains(payload);

      expect(http.patch).toHaveBeenCalledWith('system-management/tenant-settings/domains', payload);
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
      expect(http.get).toHaveBeenCalledWith('system-management/tenants/brandings', { globalHandler: false });
    });
  });

  describe('updateColours', () => {
    it('is linked to the correct url', async () => {
      await service.updateColours(mockEditColoursRequest());
      expect(http.patch).toHaveBeenCalledWith('system-management/tenant-settings/colours', mockEditColoursRequest());
    });
  });

  describe('updateTenantDetails', () => {
    it('is linked to the correct url', async () => {
      await service.updateTenantDetails(mockEditTenantDetailsRequest());
      expect(http.patch).toHaveBeenCalledWith('system-management/tenant-settings/tenant-details', mockEditTenantDetailsRequest());
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

      expect(http.getFullResponse).toHaveBeenCalledWith('system-management/tenant-settings/logo/en', {
        responseType: 'blob',
        globalHandler: false,
      });
    });
  });

  describe('validateCaptchaAllowedIpAddress', () => {
    it('is linked to the correct url', async () => {
      await service.validateCaptchaAllowedIpAddress();
      expect(http.get).toHaveBeenCalledWith('system-management/tenant-settings/validate-captcha-allowed-ip-address');
    });
  });
});
