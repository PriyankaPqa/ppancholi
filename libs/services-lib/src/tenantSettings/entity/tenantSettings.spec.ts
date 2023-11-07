import {
  mockCreateTenantSettingsRequest,
  mockEditColoursRequest,
  mockEditTenantDetailsRequest,
  mockSetDomainsRequest,
} from '@libs/entities-lib/tenantSettings';
import { IHttpMock, mockHttp, GlobalHandler } from '../../http-client';
import { TenantSettingsService } from './tenantSettings';

describe('>>> TenantSettings service', () => {
  let http: IHttpMock;
  let service: TenantSettingsService;

  beforeEach(() => {
    jest.clearAllMocks();

    jest.clearAllMocks();
    http = mockHttp();
    service = new TenantSettingsService(http as never);
  });

  describe('getCurrentTenantSettings', () => {
    it('is linked to the correct url', async () => {
      await service.getCurrentTenantSettings();
      expect(http.get).toHaveBeenCalledWith('www.test.com/system-management/tenant-settings/current-tenant-settings', { globalHandler: GlobalHandler.Partial });
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
      expect(http.get).toHaveBeenCalledWith('www.test.com/system-management/tenants/brandings', { globalHandler: GlobalHandler.Partial });
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

  describe('updateSupportEmails', () => {
    it('is linked to the correct url', async () => {
      const mockSupportEmails = {
        translation: {
          en: 'support_en@redcross.ca',
          fr: 'support_fr@redcross.ca',
        },
      };
      await service.updateSupportEmails(mockSupportEmails);
      expect(http.patch).toHaveBeenCalledWith('www.test.com/system-management/tenant-settings/support-emails', { supportEmails: mockSupportEmails });
    });
  });

  describe('getLogoUrl', () => {
    it('returns the built url', () => {
      http.getTenant = jest.fn(() => 'your-id');
      let url = service.getLogoUrl('en');

      expect(url).toBe('www.test.com/system-management/tenant-settings/your-id/logo/en');

      url = service.getLogoUrl('fr', 'other-id');

      expect(url).toBe('www.test.com/system-management/tenant-settings/other-id/logo/fr');
    });
  });

  describe('getPublicFeatures', () => {
    it('should be linked to correct URL', async () => {
      await service.getPublicFeatures();
      expect(http.get).toHaveBeenCalledWith('www.test.com/system-management/tenant-settings/public-features');
    });
  });

  describe('getBranding', () => {
    it('is linked to the correct url', async () => {
      await service.getBranding();
      expect(http.get).toHaveBeenCalledWith('www.test.com/system-management/tenant-settings/current-branding');
    });
  });

  describe('getConsentStatement', () => {
    it('should be linked to correct URL', async () => {
      await service.getConsentStatement('id-1');
      expect(http.get).toHaveBeenCalledWith('www.test.com/system-management/tenant-settings/consent-statements/id-1');
    });
  });

  describe('validateCaptchaAllowedIpAddress', () => {
    it('is linked to the correct url', async () => {
      await service.validateCaptchaAllowedIpAddress();
      expect(http.get).toHaveBeenCalledWith('www.test.com/system-management/tenant-settings/validate-captcha-allowed-ip-address');
    });
  });
});
