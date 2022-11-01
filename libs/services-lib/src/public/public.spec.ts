import { mockHttp } from '../http-client';
import { PublicService } from './public';

const http = mockHttp();

describe('>>> Public Service', () => {
  const service = new PublicService(http as never);
  type searchEventsParams = {
    filter?: string,
    language?: string,
    registrationLink?: string,
    top?: number
  };

  test('searchEvents is linked to the correct URL', async () => {
    const params: searchEventsParams = {
      language: 'en',
      registrationLink: 'link',
    };

    await service.searchEvents(params.language, params.registrationLink);
    expect(http.get).toHaveBeenCalledWith('/event/public/search/events', { params, containsEncodedURL: true, isOData: true });
  });

  test('searchEventsById builds the expected filter', async () => {
    const ids = ['id-1', 'id-2'];
    const params: searchEventsParams = {
      filter: "search.in(Entity/Id, 'id-1|id-2', '|')",
      top: 999,
    };

    await service.searchEventsById(ids);
    expect(http.get).toHaveBeenCalledWith('/event/public/search/events', { params, containsEncodedURL: true, isOData: true });
  });

  test('getTenantByEmisDomain is linked to the correct URL', async () => {
    await service.getTenantByEmisDomain('myDomain');
    expect(http.get).toHaveBeenCalledWith('/system-management/tenants/id-from-domain?domain=myDomain', { globalHandler: false, noErrorLogging: true, ignoreJwt: true });
  });

  test('getTenantByRegistrationDomain is linked to the correct URL', async () => {
    await service.getTenantByRegistrationDomain('myDomain');
    expect(http.get).toHaveBeenCalledWith('/system-management/tenants/id-from-registration-domain?registrationDomain=myDomain',
      { globalHandler: false, noErrorLogging: true, ignoreJwt: true });
  });
});
