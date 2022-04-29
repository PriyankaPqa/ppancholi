import { IOptionSubItem } from '@/entities/optionItem';
import { FilterKey, mockUserFilters } from '@/entities/user-account';
import { IHttpMock, mockHttp } from '@libs/core-lib/services/http-client';
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
    expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/current-user`, { globalHandler: false });
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

  describe('search', () => {
    it('should call the proper endpoint if a searchEndpoint parameter is passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      const searchEndpoint = 'mock-endpoint';
      await service.search(params, searchEndpoint);
      expect(http.get).toHaveBeenCalledWith(`user-account/search/${searchEndpoint}`, { params, isOData: true });
    });

    it('should call the proper endpoint if a searchEndpoint parameter is not passed', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('user-account/search/user-accounts', { params, isOData: true });
    });
  });
});
