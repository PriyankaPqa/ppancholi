import { mockUserAccount } from '@/entities/user';
import {
  IUsersServiceMock,
} from './users.types';

export const mockUsersService = (): IUsersServiceMock => ({
  fetchUser: jest.fn(() => mockUserAccount()),
  createFilter: jest.fn(() => null),
  updateFilter: jest.fn(() => null),
  removeFilter: jest.fn(() => null),
});
