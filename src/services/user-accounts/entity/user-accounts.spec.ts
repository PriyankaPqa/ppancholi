import { IOptionSubItem } from '@/entities/optionItem';
import { FilterKey, mockUserFilters } from '@/entities/user-account';
import { IHttpMock, mockHttp } from '@/services/httpClient.mock';
import { UserAccountsService } from './user-accounts';

describe('>>> UserAccounts Service', () => {
  let http: IHttpMock;
  let service: UserAccountsService;

  beforeEach(() => {
    http = mockHttp();
    service = new UserAccountsService(http as never);
  });

  test('fetchCurrentUserAccount is linked to the correct URL', async () => {
    await service.fetchCurrentUserAccount();
    expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/current-user`);
  });

  test('addFilter is linked to the correct URL and payload', async () => {
    const request = {
      name: 'Team filter',
      filterKey: FilterKey.Teams,
      criteria: ['["TeamName", "Equal", "test"]'],
    };
    await service.addFilter(request);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/filter`, {
      name: request.name,
      filterKey: request.filterKey,
      criteria: request.criteria.map((c) => JSON.stringify(c)),
    });
  });

  test('editFilter is linked to the correct URL and payload', async () => {
    const request = {
      oldFilter: {
        ...mockUserFilters()[0],
        criteria: mockUserFilters()[0].criteria.map((c) => JSON.parse(c)),
      },
      newFilter: {
        ...mockUserFilters()[1],
        criteria: mockUserFilters()[1].criteria.map((c) => JSON.parse(c)),
      },
    };
    await service.editFilter(request);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/filter`,
      {
        oldFilter: {
          name: request.oldFilter.name,
          filterKey: request.oldFilter.filterKey,
          criteria: request.oldFilter.criteria.map((c) => JSON.stringify(c)),
        },
        newFilter: {
          name: request.newFilter.name,
          filterKey: request.newFilter.filterKey,
          criteria: request.newFilter.criteria.map((c) => JSON.stringify(c)),
        },
      });
  });

  test('deleteFilter is linked to the correct URL and payload', async () => {
    const request = {
      name: 'Team filter',
      filterKey: FilterKey.Teams,
      criteria: ['["TeamName", "Equal", "test"]'],
    };
    await service.deleteFilter(request);
    expect(http.delete).toHaveBeenCalledWith(`${service.baseUrl}/filter`, {
      data: {
        deleteFilter: {
          name: request.name,
          filterKey: request.filterKey,
          criteria: request.criteria.map((c) => JSON.stringify(c)),
        },
      },
    });
  });

  test('assignRole is linked to the correct URL and payload', async () => {
    const request = {
      subRole: { id: 'role-id' } as IOptionSubItem,
      userId: 'some-id',
    };
    await service.assignRole(request);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${request.userId}/role`, { roleId: request.subRole.id });
  });

  test('setUserPreferredLanguage is linked to the correct URL and payload', async () => {
    const userId = 'some-id';
    const languageCode = 'EN';

    await service.setUserPreferredLanguage(userId, languageCode);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${userId}/preferred-language`, { languageCode });
  });

  test('setCurrentUserPreferredLanguage is linked to the correct URL and payload', async () => {
    const languageCode = 'EN';

    await service.setCurrentUserPreferredLanguage(languageCode);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/preferred-language`, { languageCode });
  });
});
