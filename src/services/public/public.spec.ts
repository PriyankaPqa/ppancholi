import { mockHttp } from '@/services/httpClient.mock';
import { PublicService } from './public';

const http = mockHttp();

describe('>>> Public Service', () => {
  const service = new PublicService(http as never);

  test('searchEvents is linked to the correct URL', async () => {
    const params = {
      language: 'en',
      registrationLink: 'link',
    };

    await service.searchEvents(params.language, params.registrationLink);
    expect(http.get).toHaveBeenCalledWith('/public-search/beneficiary-event', { params, containsEncodedURL: true });
  });

  test('getTenantByEmisDomain is linked to the correct URL', async () => {
    await service.getTenantByEmisDomain('myDomain');
    expect(http.get).toHaveBeenCalledWith('/system-management/tenants/id-from-domain?domain=myDomain', { globalHandler: false });
  });

  test('getTenantByRegistrationDomain is linked to the correct URL', async () => {
    await service.getTenantByRegistrationDomain('myDomain');
    expect(http.get).toHaveBeenCalledWith('/system-management/tenants/id-from-registration-domain?registrationDomain=myDomain', { globalHandler: false });
  });
});
