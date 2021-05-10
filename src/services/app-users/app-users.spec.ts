import { IHttpMock, mockHttp } from '@/services/httpClient.mock';
import { AppUsersService } from './app-users';

describe('>>> App Users Service', () => {
  let http: IHttpMock;
  let service: AppUsersService;

  beforeEach(() => {
    http = mockHttp();
    service = new AppUsersService(http as never);
  });

  test('fetchAllUsers is linked to the correct URL and params', async () => {
    await service.fetchAllUsers();
    expect(http.get).toHaveBeenCalledWith('/Graph/users', {
      isOData: true, params: { select: ['id', 'mobilePhone', 'businessPhones', 'mail'] },
    });
  });

  test('fetchAppUsers is linked to the correct URL', async () => {
    await service.fetchAppUsers();
    expect(http.get).toHaveBeenCalledWith('/Graph/app-users');
  });

  test('fetchRoles is linked to the correct URL', async () => {
    await service.fetchRoles();
    expect(http.get).toHaveBeenCalledWith('/Graph/roles');
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
