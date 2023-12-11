import { IOptionSubItem } from '@libs/entities-lib/optionItem';
import { FilterKey, mockUserFilters } from '@libs/entities-lib/user-account';
import { IHttpMock, mockHttp, GlobalHandler } from '../../http-client';
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
    expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/current-user`, { globalHandler: GlobalHandler.Partial });
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
    expect(http.patch).toHaveBeenCalledWith(
`${service.baseUrl}/filter`,
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
      },
);
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

  test('createUserAccount is linked to the correct URL and payload', async () => {
    const request = {
      emailAddress: 'u@ser.com',
      givenName: 'g',
      surname: 's',
      roleId: 'id',
    };
    await service.createUserAccount(request);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/user`, request, { globalHandler: GlobalHandler.Partial });
  });

  test('assignRole is linked to the correct URL and payload', async () => {
    const request = {
      subRole: { id: 'role-id' } as IOptionSubItem,
      userId: 'some-id',
    };
    await service.assignRole(request);
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/${request.userId}/role`, { roleId: request.subRole.id });
  });

  test('fetchByEventAndRole is linked to the correct URL', async () => {
    await service.fetchByEventAndRole('event1', ['r1', 'r2']);
    expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/users-by-event-role?eventId=event1&roleIds=r1&roleIds=r2`);
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

  describe('searchDirectoryUsers', () => {
    it('should call the expected endpoint', async () => {
      await service.searchDirectoryUsers('searchTerm');
      expect(http.get).toHaveBeenCalledWith('user-account/search/directory-users?searchTerm=searchTerm');
    });
  });
});
