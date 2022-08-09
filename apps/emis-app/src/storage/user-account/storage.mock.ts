import { mockOptionItems } from '@libs/entities-lib/optionItem';
import { BaseMock } from '@/storage/base/base.mock';
import {
  mockCombinedUserAccounts, mockUserAccountEntity, IUserAccountEntity, IUserAccountCombined, mockUserFilters,
} from '@libs/entities-lib/user-account';

export class UserAccountStorageMock extends BaseMock<IUserAccountCombined, IUserAccountEntity> {
  constructor() {
    super(mockCombinedUserAccounts(), mockUserAccountEntity());
  }

  protected getters = {
    ...this.baseGetters,
    currentUserFiltersByKey: jest.fn(() => [mockUserFilters()[2]]),
    roles: jest.fn(() => mockOptionItems()),
  }

  protected actions = {
    ...this.baseActions,
    addFilter: jest.fn(() => this.entity),
    editFilter: jest.fn(() => this.entity),
    deleteFilter: jest.fn(() => this.entity),
    assignRole: jest.fn(() => this.entity),
    fetchCurrentUserAccount: jest.fn(() => this.entity),
    fetchRoles: jest.fn(() => mockOptionItems()),
  }

  protected mutations = {
    ...this.baseMutations,
    setCurrentUserAccount: jest.fn(),
    setRolesFetched: jest.fn(),
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
