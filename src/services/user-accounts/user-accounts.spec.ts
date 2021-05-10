import { mockHttp } from '@/services/httpClient.mock';
import { mockSearchParams } from '@/test/helpers';
import { UserAccountsService } from './user-accounts';

const http = mockHttp();

describe('>>> User Account Service', () => {
  const service = new UserAccountsService(http as never);

  test('searchUserAccounts is linked to the correct URL and params', async () => {
    const params = mockSearchParams;
    await service.searchUserAccounts(params);
    expect(http.get).toHaveBeenCalledWith('/search/user-account-projections', { params, isOData: true });
  });

  test('addRoleToUser is linked to the correct URL', async () => {
    const payload = { roleId: '1234567', userId: '123' };
    await service.addRoleToUser(payload);
    expect(http.post).toHaveBeenCalledWith(`user-account/user-accounts/${payload.userId}/role`, { roleId: payload.roleId });
  });
});
