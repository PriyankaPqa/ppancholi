import { mockHttp } from '@/services/httpClient.mock';
import { mockUserFilters, mockUserFiltersData } from '@/entities/user';
import { UsersService } from './users';

const http = mockHttp();
const filter = mockUserFilters()[0];

describe('>>> App Users Service', () => {
  const service = new UsersService(http as never);

  test('fetchUser is linked to the correct URL', async () => {
    jest.spyOn(http, 'get').mockImplementation(() => ({
      filters: mockUserFiltersData(),
    }));

    const res = await service.fetchUser();

    expect(http.get).toHaveBeenCalledWith('user-account/user-accounts/current-user');
    expect(res.filters).toEqual(mockUserFilters());
  });

  test('createFilter is linked to the correct URL', async () => {
    await service.createFilter(filter);

    expect(http.post).toHaveBeenCalledWith('user-account/user-accounts/filter', {
      ...filter,
      criteria: filter.criteria.map((c) => JSON.stringify(c)),
    });
  });

  test('updateFilter is linked to the correct URL', async () => {
    const payload = {
      oldFilter: filter,
      newFilter: filter,
    };

    await service.updateFilter(payload);

    expect(http.patch).toHaveBeenCalledWith('user-account/user-accounts/filter', {
      oldFilter: {
        ...filter,
        criteria: filter.criteria.map((c) => JSON.stringify(c)),
      },
      newFilter: {
        ...filter,
        criteria: filter.criteria.map((c) => JSON.stringify(c)),
      },
    });
  });

  test('removeFilter is linked to the correct URL', async () => {
    const payload = {
      deleteFilter: filter,
    };

    await service.removeFilter(payload);

    expect(http.delete).toHaveBeenCalledWith('user-account/user-accounts/filter', {
      data: {
        deleteFilter: {
          ...filter,
          criteria: filter.criteria.map((c) => JSON.stringify(c)),
        },
      },
    });
  });
});
