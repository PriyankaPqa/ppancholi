import { mockHttp } from '@/services/httpClient.mock';
import { AppUsersService } from './app-users';

const http = mockHttp();

describe('>>> App Users Service', () => {
  const service = new AppUsersService(http as never);

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
});
