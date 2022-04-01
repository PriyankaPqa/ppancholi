import { IHttpMock, mockHttp } from '@libs/core-lib/services/http-client';
import { AppUsersService } from './app-users';

describe('>>> App Users Service', () => {
  let http: IHttpMock;
  let service: AppUsersService;

  beforeEach(() => {
    http = mockHttp();
    service = new AppUsersService(http as never);
  });

  test('findAppUsers is linked to the correct URL', async () => {
    await service.findAppUsers('t');
    expect(http.get).toHaveBeenCalledWith('/Graph/users', {
      isOData: true,
      params: {
        select: ['id', 'displayName', 'mail'],
        filter: ['startsWith(\'t\', surname) or startsWith(\'t\', givenName) or startsWith(\'t\', displayName) or startsWith(\'t\', Mail)'],
      },
    });
  });
});
