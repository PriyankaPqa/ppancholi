import { BaseMock } from '@/store/storage/base/base.mock';
import {
  mockCombinedUserAccounts, mockUserAccountEntity, IUserAccountEntity, IUserAccountCombined, mockUserFilters,
} from '@/entities/user-account';

export class UserAccountStorageMock extends BaseMock<IUserAccountCombined, IUserAccountEntity> {
  constructor() {
    super(mockCombinedUserAccounts(), mockUserAccountEntity());
  }

  protected getters = {
    ...this.baseGetters,
    currentUserFiltersByKey: jest.fn(() => [mockUserFilters()[2]]),
  }

  protected actions = {
    ...this.baseActions,
    addFilter: jest.fn(() => this.entity),
    editFilter: jest.fn(() => this.entity),
    deleteFilter: jest.fn(() => this.entity),
    assignRole: jest.fn(() => this.entity),
    fetchCurrentUserAccount: jest.fn(() => this.entity),
  }

  protected mutations = {
    ...this.baseMutations,
    setCurrentUserAccount: jest.fn(),
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
