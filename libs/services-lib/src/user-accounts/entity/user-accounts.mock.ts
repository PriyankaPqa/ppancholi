import { mockUserAccountEntities, mockUserAccountEntity } from '@libs/entities-lib/user-account';
import { mockDomainBaseService } from '../../base';
import { IUserAccountsServiceMock } from './user-accounts.types';

export const mockUserAccountsService = (): IUserAccountsServiceMock => ({
  ...mockDomainBaseService(mockUserAccountEntities()),
  fetchCurrentUserAccount: jest.fn(() => mockUserAccountEntity()),
  addFilter: jest.fn(() => mockUserAccountEntity()),
  editFilter: jest.fn(() => mockUserAccountEntity()),
  deleteFilter: jest.fn(() => mockUserAccountEntity()),
  createUserAccount: jest.fn(() => mockUserAccountEntity()),
  assignRole: jest.fn(() => mockUserAccountEntity()),
});
