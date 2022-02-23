import { mockUserAccountEntities, mockUserAccountEntity } from '@/entities/user-account';
import { mockDomainBaseService } from '@/services/base/base.mock';
import { IUserAccountsServiceMock } from './user-accounts.types';

export const mockUserAccountsService = (): IUserAccountsServiceMock => ({
  ...mockDomainBaseService(mockUserAccountEntities()),
  fetchCurrentUserAccount: jest.fn(() => mockUserAccountEntity()),
  addFilter: jest.fn(() => mockUserAccountEntity()),
  editFilter: jest.fn(() => mockUserAccountEntity()),
  deleteFilter: jest.fn(() => mockUserAccountEntity()),
  assignRole: jest.fn(() => mockUserAccountEntity()),
});
