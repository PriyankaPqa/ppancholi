import { mockSearchUserAccounts, mockUserAccount } from '@/entities/user-account';
import { IUserAccountsServiceMock } from './user-accounts.types';

export const mockUserAccountsService = (): IUserAccountsServiceMock => ({
  searchUserAccounts: jest.fn(() => mockSearchUserAccounts()),
  addRoleToUser: jest.fn(() => mockUserAccount()),
});
