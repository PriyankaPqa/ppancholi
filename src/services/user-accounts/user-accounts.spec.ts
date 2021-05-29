import { EOptionListItemStatus, IOptionSubItem } from '@/entities/optionItem';
import { mockHttp } from '@/services/httpClient.mock';
import { mockSearchParams } from '@/test/helpers';
import { UserAccountsService } from './user-accounts';
import { IAddRoleToUserRequest } from './user-accounts.types';

const http = mockHttp();

describe('>>> User Account Service', () => {
  const service = new UserAccountsService(http as never);

  test('searchUserAccounts is linked to the correct URL and params', async () => {
    const params = mockSearchParams;
    await service.searchUserAccounts(params);
    expect(http.get).toHaveBeenCalledWith('/search/user-account-projections', { params, isOData: true });
  });

  test('fetchAllUserAccounts is linked to the correct URL and params', async () => {
    await service.fetchAllUserAccounts();
    expect(http.get).toHaveBeenCalledWith('/search/user-account-projections', { params: { top: 999 }, isOData: true });
  });

  test('addRoleToUser is linked to the correct URL', async () => {
    const payload:IAddRoleToUserRequest = {
      subRole: {
        id: '123',
        name: {
          translation: {
            en: 'case worker 2',
            fr: 'case worker 2 fr',
          },
        },
        isDefault: false,
        isOther: false,
        orderRank: null,
        status: EOptionListItemStatus.Active,
      } as IOptionSubItem,
      userId: '123',
    };

    await service.addRoleToUser(payload);
    expect(http.post).toHaveBeenCalledWith(`user-account/user-accounts/${payload.userId}/role`, { roleId: payload.subRole.id });
  });
});
