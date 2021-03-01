import {
  IAppUsersServiceMock,
} from './app-users.types';

export const mockAppUsersService = (): IAppUsersServiceMock => ({
  fetchAllUsers: jest.fn(() => null),
  fetchAppUsers: jest.fn(() => null),
  fetchRoles: jest.fn(() => null),
});
