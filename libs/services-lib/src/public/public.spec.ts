import helpers from '@libs/shared-lib/helpers/helpers';
import { mockHttp, GlobalHandler } from '../http-client';
import { PublicService } from './public';

const http = mockHttp();

describe('>>> Public Service', () => {
  const service = new PublicService(http as never);
  type SearchEventsParams = {
    filter?: string,
    language?: string,
    registrationLink?: string,
    top?: number
  };

  test('searchEvents is linked to the correct URL', async () => {
    const params: SearchEventsParams = {
      language: 'en',
      registrationLink: 'link',
    };

    await service.fetchRegistrationEvent(params.language, params.registrationLink);
    expect(http.get).toHaveBeenCalledWith('/event/public/search/events', { params, containsEncodedURL: true });
  });

  test('searchEvents is linked to the correct URL', async () => {
    const params: SearchEventsParams = {
      top: 999,
    };

    await service.searchEvents(params);
    expect(http.get).toHaveBeenCalledWith('/event/public/search/events', { params, containsEncodedURL: true, isOData: true });
  });

  test('searchEventsById calls the helper callSearchInInBatches with the right params and return the right object', async () => {
    const ids = ['id-1', 'id-2'];
    helpers.callSearchInInBatches = jest.fn();
    await service.searchEventsById(ids);
    expect(helpers.callSearchInInBatches).toHaveBeenCalledWith({
      searchInFilter: 'search.in(Entity/Id, \'{ids}\')',
      service,
      ids,
      api: 'searchEvents',
    });
  });

  test('getTenantByEmisDomain is linked to the correct URL', async () => {
    await service.getTenantByEmisDomain('myDomain');
    expect(http.get)
      .toHaveBeenCalledWith('/system-management/tenants/id-from-domain?domain=myDomain', { globalHandler: GlobalHandler.Partial, noErrorLogging: true, ignoreJwt: true });
  });

  // FeatureKeys.UseIdentityServer
  test('getPublicFeatures is linked to the correct URL', async () => {
    await service.getPublicFeatures();
    expect(http.get)
      .toHaveBeenCalledWith('/system-management/tenant-settings/public-features', { globalHandler: GlobalHandler.Partial, noErrorLogging: true, ignoreJwt: true });
  });

  test('getTenantByRegistrationDomain is linked to the correct URL', async () => {
    await service.getTenantByRegistrationDomain('myDomain');
    expect(http.get).toHaveBeenCalledWith(
      '/system-management/tenants/id-from-registration-domain?registrationDomain=myDomain',
      { globalHandler: GlobalHandler.Partial, noErrorLogging: true, ignoreJwt: true },
    );
  });

  test('resetPublicToken sets token empty', () => {
    service.resetPublicToken();
    expect(http.setPublicToken).toHaveBeenCalledWith('');
  });
});
